import { inngest } from '@/inngest/client';
import { INGEST_KB_EVENT, INGEST_KB_ID } from '@/inngest/constants';
import { ingestKnowledgeBase } from '@/lib/knowledge';
import { MavenAGIClient } from 'mavenagi';

import { IngestKBEventData } from '../types';

export const ingestKnowledgeBaseFunction = inngest.createFunction(
  {
    id: INGEST_KB_ID,
    retries: 5,
    concurrency: {
      limit: 3,
      key: 'event.data.agentId' + '-' + 'event.data.organizationId',
    },
  },
  { event: INGEST_KB_EVENT },
  async ({ event, step }) => {
    const { organizationId, agentId, settings, knowledgeBaseId } = event.data as IngestKBEventData;
    const client = new MavenAGIClient({
      organizationId,
      agentId,
    });
    await ingestKnowledgeBase({
      client,
      apiToken: settings.apiToken,
      knowledgeBaseId,
      step,
    });
  }
);
