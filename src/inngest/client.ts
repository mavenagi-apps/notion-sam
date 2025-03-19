import { INGEST_KB_EVENT, INNGEST_ID } from '@/inngest/constants';
import { IngestKBEventData } from '@/inngest/types';
import { EventSchemas, Inngest } from 'inngest';

export const inngest = new Inngest({
  id: INNGEST_ID,
  schema: new EventSchemas().fromRecord<{
    [INGEST_KB_EVENT]: {
      data: IngestKBEventData;
    };
  }>(),
});
