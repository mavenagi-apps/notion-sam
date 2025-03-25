import { inngest } from '@/inngest/client';
import { KB_ID, fetchNextNotionPages, fetchNotionPageMarkdown } from '@/utils/notion';
import { APIResponseError, Client } from '@notionhq/client';
import Bottleneck from 'bottleneck';
import { BaseContext } from 'inngest';
import { MavenAGIClient } from 'mavenagi';

type NotionPageInfo = {
  id: string;
  title?: string;
  url: string;
};

// rate-limit Maven API calls
const mavenApiLimiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 100,
});

export async function ingestKnowledgeBase({
  client,
  apiToken,
  knowledgeBaseId,
  step,
}: {
  client: MavenAGIClient;
  apiToken: string;
  knowledgeBaseId?: string;
  step: BaseContext<typeof inngest>['step'];
}) {
  const notion = new Client({
    auth: apiToken,
    fetch: (url, init) => {
      const useCache = url.startsWith('https://api.notion.com/v1/blocks/');
      return fetch(url, {
        ...init,
        next: useCache
          ? {
              revalidate: 3600, // 1 hour cache
            }
          : undefined,
      });
    },
  });

  await step.run('setup', async () => {
    console.info(`Notion: Start ingest for KB`);
    // Just in case we had a past failure, finalize any old versions so we can start from scratch
    // TODO(maven): Make the platform more lenient so this isn't necessary
    try {
      await client.knowledge.finalizeKnowledgeBaseVersion(KB_ID);
    } catch (error) {
      // Ignored
      console.warn('Failed to finalize old version', error);
    }

    const kb = await client.knowledge.createOrUpdateKnowledgeBase({
      name: 'Notion Knowledge Base',
      type: 'API',
      knowledgeBaseId: { referenceId: knowledgeBaseId || KB_ID },
    });

    await client.knowledge.createKnowledgeBaseVersion(kb.knowledgeBaseId.referenceId, {
      type: 'FULL',
    });
  });

  let cursor: string | null | undefined;
  do {
    const output = await step.run(`search-${cursor ? cursor : 'start'}`, async () => {
      const { pages, cursor: nextCursor } = await fetchNextNotionPages(notion, cursor);
      console.info(`Notion: Found ${pages.length} pages`);
      const titledPages = pages.map((page) => {
        const pageProperties = page.properties;
        const pageTitle = Object.values(pageProperties).find((prop) => prop.type === 'title')
          ?.title?.[0]?.plain_text;

        return {
          id: page.id,
          title: pageTitle,
          url: page.url,
        } as NotionPageInfo;
      });
      const nonEmptyPages = titledPages.filter((page) => {
        return !!page.title;
      });
      console.info(`Notion: Found ${nonEmptyPages.length} non-empty pages`);
      return { cursor: nextCursor, pages: nonEmptyPages };
    });
    await step.run(
      `process-${cursor ? cursor : 'start'}`,
      async (pages: NotionPageInfo[]) => {
        try {
          await Promise.all(
            pages.map(async (page) => {
              const content = await fetchNotionPageMarkdown(notion, page.id);
              if (content) {
                await mavenApiLimiter.schedule(() =>
                  client.knowledge.createKnowledgeDocument(knowledgeBaseId || KB_ID, {
                    knowledgeDocumentId: { referenceId: page.id },
                    title: page.title!,
                    content: content,
                    contentType: 'MARKDOWN',
                  })
                );
              } else {
                console.warn('Notion: Skipping page due to empty content', page.id);
              }
            })
          );
        } catch (error) {
          if ((error as APIResponseError)?.status === 404) {
            console.warn('Notion: ', (error as Error).message);
            return;
          }
          throw error;
        }
      },
      output.pages
    );
    cursor = output.cursor;
  } while (cursor);

  await step.run('finalize', async () => {
    console.info(`Finalizing version for KB ${knowledgeBaseId || KB_ID}`);
    await client.knowledge.finalizeKnowledgeBaseVersion(knowledgeBaseId || KB_ID);
  });
}
