import { inngest } from '@/inngest/client';
import { INGEST_KB_EVENT, INGEST_KB_ID } from '@/inngest/constants';
import { Client } from '@notionhq/client';

export default {
  async preInstall({
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    try {
      const notion = new Client({ auth: settings.apiToken });

      // run a search to see if we have access to the Notion API
      await notion.search({ filter: { property: 'object', value: 'page' }, page_size: 1 });
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
    await inngest.send({
      name: INGEST_KB_EVENT,
      id: `${INGEST_KB_ID}-${organizationId}-${agentId}`,
      data: {
        organizationId,
        agentId,
        settings,
      },
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
    await inngest.send({
      name: INGEST_KB_EVENT,
      id: `${INGEST_KB_ID}-${organizationId}-${agentId}`,
      data: {
        organizationId,
        agentId,
        settings,
        knowledgeBaseId: knowledgeBaseId.referenceId,
      },
    });
  },
};
