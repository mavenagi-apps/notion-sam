import { APIResponseError, Client } from '@notionhq/client';
import { PageObjectResponse, SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import Bottleneck from 'bottleneck';
import { KnowledgeDocumentRequest } from 'mavenagi/api';
import { NotionToMarkdown } from 'notion-to-md';

export enum RetryableStatusCodes {
  TOO_MANY_REQUESTS = 429,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

type NotionPage = SearchResponse['results'][number];

// Notion API rate limits
// https://developers.notion.com/reference/request-limits
const notionApiLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 300, // 3 requests per second
});

notionApiLimiter.on('failed', async (error, info) => {
  console.warn('Notion.APIResponseError', error);
  const apiError = error as APIResponseError;
  if (!Object.values(RetryableStatusCodes).includes(apiError?.status)) {
    return;
  }

  const { retryCount } = info;
  const backoffs = [0.2, 0.4, 0.8, 1, 2];
  if (backoffs.length <= retryCount) {
    // stop retrying after 5 attempts
    return;
  }
  const defaultRetryAfter = backoffs[retryCount] * 1000;
  const headers = apiError.headers as Headers;
  if (headers.get('retry-after')?.length) {
    const retryAfterSeconds = parseInt(headers.get('retry-after')!, 10);
    return retryAfterSeconds * 1000;
  }
  return defaultRetryAfter;
});

// this is fixed for now
export const KB_ID = 'notion';

const pageSize = 100;

export async function fetchNextNotionPages(notion: Client, cursor: string | null | undefined) {
  let pages: NotionPage[] = [];
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

  return { pages, cursor };
}

export async function* fetchNotionPages(notion: Client) {
  let pages: NotionPage[] = [];
  let cursor: string | null | undefined = undefined;
  do {
    let results: NotionPage[] = [];
    ({ cursor, pages: results } = await fetchNextNotionPages(notion, cursor));
    yield results;
  } while (cursor);
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
    const mdBlocks = await notionApiLimiter.schedule(() => n2m.pageToMarkdown(page.id));
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
