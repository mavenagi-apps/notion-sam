import { Client } from '@notionhq/client';
import { MavenAGIClient } from "mavenagi";
import { NotionToMarkdown } from "notion-to-md";

export const ingestKnowledgeBase = async ({ client, apiToken, knowledgeBaseId } : {client: MavenAGIClient, apiToken: string, knowledgeBaseId?: string}) => {
  const notion = new Client({ auth:  apiToken });
  console.info(`Notion: Start ingest for KB`);
  let pages: any[] = [];
  let cursor: string | null | undefined = undefined;
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const {has_more, next_cursor, results} = await notion.search({
    filter: {
      property: 'object',
      value: 'page',
    },
    start_cursor: cursor,
  });
  const firstPage = results[0];
  const kbId = knowledgeBaseId || `notion_knowledge_base-${firstPage.id}`;

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
    knowledgeBaseId: { referenceId: kbId },
  });

  await client.knowledge.createKnowledgeBaseVersion(kb.knowledgeBaseId.referenceId, {
    type: "FULL"
  });

  do {
    const {has_more, next_cursor, results} = await notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      start_cursor: cursor,
    });

    pages = pages.concat(results);
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

      console.log('page id', page.id);
      console.log('page title', pageTitle);
      console.log("markdown content", markdownContent);
      await client.knowledge.createKnowledgeDocument(kbId, {
        title: pageTitle,
        content: markdownContent,
        contentType: 'MARKDOWN',
        knowledgeDocumentId: { referenceId: page.id },
      });
    }

    cursor = has_more ? next_cursor : undefined;
  } while (cursor);

  console.info(`Finalizing version for KB ${kbId}`);
  await client.knowledge.finalizeKnowledgeBaseVersion(kbId);
}