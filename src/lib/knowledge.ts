import { inngest } from "@/inngest/client";
import { INGEST_KB_EVENT, INGEST_KB_ID } from '@/inngest/constants';

export async function refreshKnowledge(
  organizationId: string,
  agentId: string,
  settings: AppSettings,
) {
  console.info("Submitting refresh knowledge job with params:", {
    organizationId,
    agentId,
    settings,
  });
  
  await inngest.send({
    name: INGEST_KB_EVENT,
    id: `${INGEST_KB_ID}-${organizationId}-${agentId}`,
    data: {
      organizationId,
      agentId,
      settings,
    },
  });
}

// Re-export the existing ingestKnowledgeBase function for backward compatibility
export { ingestKnowledgeBase } from './knowledge-legacy';