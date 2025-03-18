import { ingestKnowledgeBase } from '@/lib/knowledge';
import { MavenAGIClient } from 'mavenagi';

import { inngest } from '../client';
import { INGEST_KB_EVENT, INGEST_KB_ID } from '../constants';
import type { IngestKBEventData } from '../types';

export const ingestKnowledgeBaseFunction = inngest.createFunction(
  {
    id: INGEST_KB_ID,
    retries: 5,
  },
  { event: INGEST_KB_EVENT },
  async ({ event }) => {
    const { organizationId, agentId, settings, knowledgeBaseId } = event.data as IngestKBEventData;
    const client = new MavenAGIClient({
      organizationId: organizationId,
      agentId: agentId,
    });

    await ingestKnowledgeBase({
      client: client,
      apiToken: settings.apiToken,
      knowledgeBaseId: knowledgeBaseId,
    });
  }
);
