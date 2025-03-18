import { inngest } from '@/inngest/client';
import { ingestKnowledgeBaseFunction } from '@/inngest/functions/ingestKnowledgeBase';
import { serve } from 'inngest/next';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [ingestKnowledgeBaseFunction],
});
