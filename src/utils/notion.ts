import { Client } from '@notionhq/client';
import { PageObjectResponse, SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import Bottleneck from 'bottleneck';
import { KnowledgeDocumentRequest } from 'mavenagi/api';
import { NotionToMarkdown } from 'notion-to-md';

type NotionPage = SearchResponse['results'][number];

const notionApiLimiter = new Bottleneck({
  maxConcurrent: 25,
  minTime: 200,
});

// this is fixed for now
export const KB_ID = 'notion';

const pageSize = 100;

export async function fetchNotionPages(notion: Client) {
  let pages: NotionPage[] = [];
  let cursor: string | null | undefined = undefined;
  do {
    await notionApiLimiter.schedule(async () => {
      const nextCursor = cursor;
      const { has_more, next_cursor, results } = await notion.search({
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

export async function processNotionPages(notion: Client, pages: PageObjectResponse[]) {
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const processedPages: KnowledgeDocumentRequest[] = [];
  for (const page of pages) {
    // Since Notion allows for a given database to configure any property name to hold the page title, we have to
    // loop to find it. For example, the 'title' could be in "Project Name" or "Title".
    const pageProperties = page.properties;
    let pageTitle = '';
    for (const prop in pageProperties) {
      if (pageProperties[prop].type === 'title') {
        if (
          pageProperties[prop]?.title &&
          pageProperties[prop].title.length > 0 &&
          pageProperties[prop].title[0]?.plain_text
        ) {
          pageTitle = pageProperties[prop].title[0].plain_text;
          break;
        }
      }
    }

    if (!pageTitle) {
      console.warn(`Skipping page with id ${page.id} due to missing title`);
      continue;
    }
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);
    const markdownContent = mdString.parent;
    if (markdownContent) {
      processedPages.push({
        title: pageTitle,
        content: markdownContent,
        contentType: 'MARKDOWN',
        url: page.url,
        knowledgeDocumentId: { referenceId: page.id },
      });
    } else {
      console.warn(`Skipping page with id ${page.id} due to missing content`);
    }
  }
  return processedPages;
}
