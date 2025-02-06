import { ingestKnowledgeBase } from '@/utils/notion';
import { Client } from '@notionhq/client';
import { MavenAGIClient } from 'mavenagi';

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
