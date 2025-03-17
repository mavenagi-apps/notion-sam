import { Client } from '@notionhq/client';
import { MavenAGIClient } from 'mavenagi';

import { ingestKnowledgeBase } from './lib/knowledge';

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
