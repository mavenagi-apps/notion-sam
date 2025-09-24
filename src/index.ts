import { refreshKnowledge } from "@lib/knowledge";
import { Client } from '@notionhq/client';

const hooks = {
  /**
   * Use for any required validation steps, eg. credentials etc.
   */
  async preInstall({
    organizationId,
    agentId,
    settings
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    console.log("preInstall", organizationId, agentId);

    try {
      const notion = new Client({ auth: settings.apiToken });
      // run a search to see if we have access to the Notion API
      await notion.search({ filter: { property: 'object', value: 'page' }, page_size: 1 });
    } catch (e) {
      throw new Error(`Failed to connect to Notion API: ${(e as Error).message}`);
    }
  },

  /**
   * For installing actions, knowledge, etc
   */
  async postInstall({
    organizationId,
    agentId,
    settings
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    console.log("postInstall", organizationId, agentId);

    await refreshKnowledge(organizationId, agentId, settings);
  },

  /**
   * Handler for refresh of knowledge base
   */
  async knowledgeBaseRefreshed({
    organizationId,
    agentId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    console.info('knowledgeBaseRefreshed', { organizationId, agentId });

    await refreshKnowledge(organizationId, agentId, settings);
  },

  /**
   * Handler for any installed action(s)
   */
  async executeAction({
    actionId,
    parameters,
  }: {
    actionId: string;
    parameters: Record<string, string>;
  }) {
    console.log("executeAction", actionId, parameters);
  },
};

export default hooks;