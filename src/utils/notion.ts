import { APIResponseError, Client, RequestTimeoutError } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Bottleneck from 'bottleneck';
import { NotionToMarkdown } from 'notion-to-md';

export enum RetryableStatusCodes {
  TOO_MANY_REQUESTS = 429,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

function getNotionRateLimiter() {
  // Notion API rate limits
  // https://developers.notion.com/reference/request-limits
  const notionApiLimiter = new Bottleneck({
    maxConcurrent: 3,
    minTime: 300, // 3 requests per second
  });

  notionApiLimiter.on('failed', async (error, info) => {
    console.warn('Failed to execute Notion API request', error);
    const apiError = error as APIResponseError;
    if (
      !Object.values(RetryableStatusCodes).includes(apiError?.status) &&
      !(error instanceof RequestTimeoutError)
    ) {
      return;
    }

    const { retryCount } = info;
    const backoffs = [0.2, 0.4, 0.8, 1, 2];
    if (backoffs.length <= retryCount) {
      // stop retrying after 5 attempts
      return;
    }
    const defaultRetryAfter = backoffs[retryCount] * 1000;
    const headers = apiError?.headers as Headers | null;
    if (headers?.get('retry-after')?.length) {
      const retryAfterSeconds = parseInt(headers.get('retry-after')!, 10);
      return retryAfterSeconds * 1000;
    }
    return defaultRetryAfter;
  });
  return notionApiLimiter;
}

// this is fixed for now
export const KB_ID = 'notion';

const pageSize = 25;

export async function fetchNextNotionPages(notion: Client, cursor: string | null | undefined) {
  let pages: PageObjectResponse[] = [];
  await getNotionRateLimiter().schedule(async () => {
    const nextCursor = cursor;
    const { has_more, next_cursor, results } = await notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      start_cursor: nextCursor ?? undefined,
      page_size: pageSize,
    });
    pages = results as PageObjectResponse[];
    cursor = has_more ? next_cursor : undefined;
  });

  return { pages, cursor };
}

export async function fetchNotionPageMarkdown(notion: Client, id: string) {
  const n2m = new NotionToMarkdown({
    notionClient: notion,
    config: {
      parseChildPages: false, // we only want the top-level page content... referenced pages show up in the search results
    },
  });
  const mdBlocks = await getNotionRateLimiter().schedule(() => n2m.pageToMarkdown(id));
  const mdString = n2m.toMarkdownString(mdBlocks);
  const markdownContent = mdString.parent;
  if (markdownContent) {
    return markdownContent;
  } else {
    return null;
  }
}
