import { inngest } from '@/inngest/client';
import { KB_ID, fetchNextNotionPages, processNotionPages } from '@/utils/notion';
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Bottleneck from 'bottleneck';
import { BaseContext } from 'inngest';
import { MavenAGIClient } from 'mavenagi';

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
  const notion = new Client({ auth: apiToken });
  console.info(`Notion: Start ingest for KB`);

  step.run('setup', async () => {
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
    cursor = await step.run(`process-${cursor ? cursor : 'start'}`, async () => {
      const { pages, cursor: nextCursor } = await fetchNextNotionPages(notion, cursor);
      const processedPages = await processNotionPages(
        notion,
        pages as unknown as PageObjectResponse[]
      );

      // write pages to KB
      await Promise.all(
        processedPages.map(async (page) => {
          await mavenApiLimiter.schedule(() =>
            client.knowledge.createKnowledgeDocument(knowledgeBaseId || KB_ID, page)
          );
        })
      );
      return nextCursor;
    });
  } while (cursor);

  await step.run('finalize', async () => {
    console.info(`Finalizing version for KB ${knowledgeBaseId || KB_ID}`);
    await client.knowledge.finalizeKnowledgeBaseVersion(knowledgeBaseId || KB_ID);
  });
}
