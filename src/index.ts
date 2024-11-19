import { MavenAGIClient } from 'mavenagi';
import { ingestKnowledgeBase } from '@/utils/notion';

export default {
  async preInstall({
    organizationId,
    agentId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {},

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

    // Setup actions, users, knowledge, etc
    await ingestKnowledgeBase({
      client: client,
      apiToken: settings.apiToken,
      knowledgeBaseId: knowledgeBaseId.referenceId,
    });
  },
};
