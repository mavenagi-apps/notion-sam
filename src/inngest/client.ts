import { EventSchemas, Inngest } from 'inngest';

import { INGEST_KB_EVENT, INNGEST_ID } from './constants';
import { IngestKBEventData } from './types';

export const inngest = new Inngest({
  id: INNGEST_ID,
  schema: new EventSchemas().fromRecord<{
    [INGEST_KB_EVENT]: {
      data: IngestKBEventData;
    };
  }>(),
});
