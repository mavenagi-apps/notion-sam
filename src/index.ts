import { fetchNotionPages, processNotionPages } from '@/utils/notion';
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Bottleneck from 'bottleneck';
import { MavenAGIClient } from 'mavenagi';

// rate-limit Maven API calls
const mavenApiLimiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 100,
});

// this is fixed for now
const kbId = 'notion';

async function ingestKnowledgeBase({
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

  // fetch notion pages
  const pages = await fetchNotionPages(notion);

  console.info(`Notion: Found ${pages.length} pages`);

  // Just in case we had a past failure, finalize any old versions so we can start from scratch
  // TODO(maven): Make the platform more lenient so this isn't necessary
  try {
    await client.knowledge.finalizeKnowledgeBaseVersion(kbId);
  } catch (error) {
    // Ignored
    console.warn('Failed to finalize old version', error);
  }

  const kb = await client.knowledge.createOrUpdateKnowledgeBase({
    name: 'Notion Knowledge Base',
    type: 'API',
    knowledgeBaseId: { referenceId: knowledgeBaseId || kbId },
  });

  await client.knowledge.createKnowledgeBaseVersion(kb.knowledgeBaseId.referenceId, {
    type: 'FULL',
  });

  // process notion pages
  const processedPages = await processNotionPages(notion, pages as unknown as PageObjectResponse[]);

  // write pages to KB
  await Promise.all(
    processedPages.map(async (page) => {
      await mavenApiLimiter.schedule(() =>
        client.knowledge.createKnowledgeDocument(knowledgeBaseId || kbId, page)
      );
    })
  );

  console.info(`Finalizing version for KB ${knowledgeBaseId || kbId}`);
  await client.knowledge.finalizeKnowledgeBaseVersion(knowledgeBaseId || kbId);
}

export default {
  async preInstall({
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    try {
      new Client({ auth: settings.apiToken });
    } catch (e) {
      throw new Error(`Failed to connect to Notion API: ${(e as Error).message}`);
    }
  },
  async postInstall({
    organizationId,
    agentId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    const client = new MavenAGIClient({
      organizationId: organizationId,
      agentId: agentId,
    });

    // Setup actions, users, knowledge, etc
    await ingestKnowledgeBase({
      client: client,
      apiToken: settings.apiToken,
    });
  },

  /**
   * Handler for refresh of knowledge base
   */
  async knowledgeBaseRefreshed({
    organizationId,
    agentId,
    knowledgeBaseId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    knowledgeBaseId: { referenceId: string };
    settings: AppSettings;
  }) {
    const client = new MavenAGIClient({
      organizationId: organizationId,
      agentId: agentId,
    });
    console.info('Knowledge base refreshed', knowledgeBaseId);
    // Setup actions, users, knowledge, etc
    await ingestKnowledgeBase({
      client: client,
      apiToken: settings.apiToken,
      knowledgeBaseId: knowledgeBaseId.referenceId,
    });
  },
};
