import { KB_ID, fetchNotionPages, processNotionPages } from '@/utils/notion';
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Bottleneck from 'bottleneck';
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
}: {
  client: MavenAGIClient;
  apiToken: string;
  knowledgeBaseId?: string;
}) {
  const notion = new Client({ auth: apiToken });
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

  // fetch notion pages
  for await (const pages of fetchNotionPages(notion)) {
    // process notion pages
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
  }

  console.info(`Finalizing version for KB ${knowledgeBaseId || KB_ID}`);
  await client.knowledge.finalizeKnowledgeBaseVersion(knowledgeBaseId || KB_ID);
}
