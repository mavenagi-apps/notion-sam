import { Client } from '@notionhq/client';
import { MavenAGIClient } from "mavenagi";
import { NotionToMarkdown } from "notion-to-md";
import Bottleneck from "bottleneck";
import {KnowledgeDocumentRequest} from "mavenagi/api";

// rate-limit all API calls
const mavenApiLimiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 100
});

const notionApiLimiter = new Bottleneck({
  maxConcurrent: 30,
  minTime: 100
});

// this is fixed for now
const kbId = 'notion';

const pageSize = 100;

export async function fetchNotionPages(notion: Client) {
  let pages: any[] = [];
  let cursor: string | null | undefined = undefined;
  do {
      await notionApiLimiter.schedule(async () => {
          const nextCursor = cursor;
          const {has_more, next_cursor, results} = await notion.search({
              filter: {
                  property: 'object',
                  value: 'page',
              },
              start_cursor: nextCursor ?? undefined,
              page_size: pageSize,
          });
          pages = pages.concat(results);
          cursor = has_more ? next_cursor : undefined;
      });
  } while (cursor);

  return pages;
}

export async function processNotionPages(notion: Client, pages: any[]) {
    const n2m = new NotionToMarkdown({ notionClient: notion });
    let processedPages: KnowledgeDocumentRequest[] = [];
    for (const page of pages) {
        // Since Notion allows for a given database to configure any property name to hold the page title, we have to
        // loop to find it. For example, the 'title' could be in "Project Name" or "Title".
        const pageProperties = page.properties;
        let pageTitle = '';
        for (let prop in pageProperties) {
          if (pageProperties[prop].type === "title") {
              pageTitle = pageProperties[prop].title[0].text.content;
              break;
          }
        }

        if (!pageTitle) {
          console.warn(`Skipping page with id ${page.id} due to missing title`);
          continue;
        }
        const mdBlocks = await n2m.pageToMarkdown(page.id);
        const mdString = n2m.toMarkdownString(mdBlocks);
        const markdownContent = mdString.parent;
        processedPages.push({
            title: pageTitle,
            content: markdownContent,
            contentType: 'MARKDOWN',
            knowledgeDocumentId: { referenceId: page.id },
        });
    }
    return processedPages;
}

export const ingestKnowledgeBase = async ({ client, apiToken, knowledgeBaseId } : {client: MavenAGIClient, apiToken: string, knowledgeBaseId?: string}) => {
  const notion = new Client({ auth:  apiToken });
  console.info(`Notion: Start ingest for KB`);

  // fetch notion pages
  const pages = await fetchNotionPages(notion);

  // Just in case we had a past failure, finalize any old versions so we can start from scratch
  // TODO(maven): Make the platform more lenient so this isn't necessary
  try {
    await client.knowledge.finalizeKnowledgeBaseVersion(kbId);
  } catch (error) {
    // Ignored
  }

  const kb = await client.knowledge.createOrUpdateKnowledgeBase({
    name: 'Notion Knowledge Base',
    type: 'API',
    knowledgeBaseId: { referenceId: knowledgeBaseId || kbId },
  });

  await client.knowledge.createKnowledgeBaseVersion(kb.knowledgeBaseId.referenceId, {
    type: "FULL"
  });

  // process notion pages
  const processedPages = await processNotionPages(notion, pages);

  // write pages to KB
  await Promise.all(processedPages.map(async (page) => {
      await mavenApiLimiter.schedule(() => client.knowledge.createKnowledgeDocument(knowledgeBaseId || kbId, page));
  }));

  console.info(`Finalizing version for KB ${knowledgeBaseId || kbId}`);
  await client.knowledge.finalizeKnowledgeBaseVersion(knowledgeBaseId || kbId);
}