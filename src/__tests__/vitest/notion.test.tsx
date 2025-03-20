import { fetchNextNotionPages, processNotionPages } from '@/utils/notion';
import { Client } from '@notionhq/client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@notionhq/client', () => {
  return {
    Client: vi.fn().mockImplementation(() => {
      return {
        search: vi
          .fn()
          .mockResolvedValueOnce({
            has_more: true,
            next_cursor: 'next-cursor',
            results: [
              {
                object: 'page',
                id: 'ae1905c3-b77b-475b-b98f-7596c242137f',
                created_time: '2021-05-21T16:41:00.000Z',
                last_edited_time: '2021-05-21T16:41:00.000Z',
                created_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                last_edited_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                cover: null,
                icon: null,
                parent: {
                  type: 'database_id',
                  database_id: '8e2c2b76-9e1d-47d2-87b9-ed3035d607ae',
                },
                archived: false,
                properties: {
                  'Score /5': {
                    id: ')Y7%22',
                    type: 'select',
                    select: {
                      id: '5c944de7-3f4b-4567-b3a1-fa2c71c540b6',
                      name: '⭐️⭐️⭐️⭐️⭐️',
                      color: 'default',
                    },
                  },
                  Type: {
                    id: '%2F7eo',
                    type: 'select',
                    select: {
                      id: 'f96d0d0a-5564-4a20-ab15-5f040d49759e',
                      name: 'Article',
                      color: 'default',
                    },
                  },
                  Publisher: {
                    id: '%3E%24Pb',
                    type: 'select',
                    select: {
                      id: '01f82d08-aa1f-4884-a4e0-3bc32f909ec4',
                      name: 'The Atlantic',
                      color: 'red',
                    },
                  },
                  Summary: {
                    id: '%3F%5C25',
                    type: 'rich_text',
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content:
                            'Some think chief ethics officers could help technology companies navigate political and social questions.',
                          link: null,
                        },
                        annotations: {
                          bold: true,
                          italic: true,
                          strikethrough: true,
                          underline: true,
                          code: true,
                          color: 'default',
                        },
                        plain_text:
                          'Some think chief ethics officers could help technology companies navigate political and social questions.',
                        href: null,
                      },
                    ],
                  },
                  'Publishing/Release Date': {
                    id: '%3Fex%2B',
                    type: 'date',
                    date: {
                      start: '2020-12-08T12:00:00.000+00:00',
                      end: null,
                      time_zone: null,
                    },
                  },
                  Link: {
                    id: 'VVMi',
                    type: 'url',
                    url: 'https://www.nytimes.com/2018/10/21/opinion/who-will-teach-silicon-valley-to-be-ethical.html',
                  },
                  Read: {
                    id: '_MWJ',
                    type: 'checkbox',
                    checkbox: false,
                  },
                  Status: {
                    id: '%60zz5',
                    type: 'select',
                    select: {
                      id: '8c4a056e-6709-4dd1-ba58-d34d9480855a',
                      name: 'Ready to Start',
                      color: 'yellow',
                    },
                  },
                  Author: {
                    id: 'qNw_',
                    type: 'multi_select',
                    multi_select: [],
                  },
                  Name: {
                    id: 'title',
                    type: 'title',
                    title: [
                      {
                        type: 'text',
                        text: {
                          content: 'New Media Article',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text: 'New Media Article',
                        href: null,
                      },
                    ],
                  },
                },
                url: 'https://www.notion.so/New-Media-Article-ae1905c3b77b475bb98f7596c242137f',
              },
              {
                object: 'page',
                id: '8f16061d-4b77-4dbc-bf04-e8b0b4319b5a',
                created_time: '2021-05-21T16:42:00.000Z',
                last_edited_time: '2021-05-21T16:42:00.000Z',
                created_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                last_edited_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                cover: null,
                icon: null,
                parent: {
                  type: 'database_id',
                  database_id: '7a94f22f-59ae-484d-90ac-4aeddd667641',
                },
                archived: false,
                properties: {
                  'Score /5': {
                    id: ')Y7%22',
                    type: 'select',
                    select: {
                      id: '5c944de7-3f4b-4567-b3a1-fa2c71c540b6',
                      name: '⭐️⭐️⭐️⭐️⭐️',
                      color: 'default',
                    },
                  },
                  Type: {
                    id: '%2F7eo',
                    type: 'select',
                    select: {
                      id: 'f96d0d0a-5564-4a20-ab15-5f040d49759e',
                      name: 'Article',
                      color: 'default',
                    },
                  },
                  Publisher: {
                    id: '%3E%24Pb',
                    type: 'select',
                    select: {
                      id: '01f82d08-aa1f-4884-a4e0-3bc32f909ec4',
                      name: 'The Atlantic',
                      color: 'red',
                    },
                  },
                  Summary: {
                    id: '%3F%5C25',
                    type: 'rich_text',
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content:
                            'Some think chief ethics officers could help technology companies navigate political and social questions.',
                          link: null,
                        },
                        annotations: {
                          bold: true,
                          italic: true,
                          strikethrough: true,
                          underline: true,
                          code: true,
                          color: 'default',
                        },
                        plain_text:
                          'Some think chief ethics officers could help technology companies navigate political and social questions.',
                        href: null,
                      },
                    ],
                  },
                  'Publishing/Release Date': {
                    id: '%3Fex%2B',
                    type: 'date',
                    date: {
                      start: '2020-12-08T12:00:00.000+00:00',
                      end: null,
                      time_zone: null,
                    },
                  },
                  date: {
                    id: 'Lpwp',
                    type: 'date',
                    date: null,
                  },
                  Link: {
                    id: 'VVMi',
                    type: 'url',
                    url: 'https://www.nytimes.com/2018/10/21/opinion/who-will-teach-silicon-valley-to-be-ethical.html',
                  },
                  'Wine Pairing': {
                    id: 'WO%40Z',
                    type: 'rich_text',
                    rich_text: [],
                  },
                  Read: {
                    id: '_MWJ',
                    type: 'checkbox',
                    checkbox: false,
                  },
                  Status: {
                    id: '%60zz5',
                    type: 'select',
                    select: {
                      id: '8c4a056e-6709-4dd1-ba58-d34d9480855a',
                      name: 'Ready to Start',
                      color: 'yellow',
                    },
                  },
                  Author: {
                    id: 'qNw_',
                    type: 'multi_select',
                    multi_select: [],
                  },
                  Name: {
                    id: 'title',
                    type: 'title',
                    title: [
                      {
                        type: 'text',
                        text: {
                          content: 'New Media Article',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text: 'New Media Article',
                        href: null,
                      },
                    ],
                  },
                },
                url: 'https://www.notion.so/New-Media-Article-8f16061d4b774dbcbf04e8b0b4319b5a',
              },
            ],
          })
          .mockResolvedValueOnce({
            has_more: false,
            next_cursor: null,
            results: [
              {
                object: 'page',
                id: 'dc2a9117-163d-4075-907e-604b2f04c504',
                created_time: '2021-06-15T17:23:00.000Z',
                last_edited_time: '2021-06-15T17:23:00.000Z',
                created_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                last_edited_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                cover: null,
                icon: null,
                parent: {
                  type: 'database_id',
                  database_id: '7a94f22f-59ae-484d-90ac-4aeddd667641',
                },
                archived: false,
                properties: {
                  'Score /5': {
                    id: ')Y7%22',
                    type: 'select',
                    select: {
                      id: '5c944de7-3f4b-4567-b3a1-fa2c71c540b6',
                      name: '⭐️⭐️⭐️⭐️⭐️',
                      color: 'default',
                    },
                  },
                  Type: {
                    id: '%2F7eo',
                    type: 'select',
                    select: {
                      id: 'f96d0d0a-5564-4a20-ab15-5f040d49759e',
                      name: 'Article',
                      color: 'default',
                    },
                  },
                  Publisher: {
                    id: '%3E%24Pb',
                    type: 'select',
                    select: {
                      id: '01f82d08-aa1f-4884-a4e0-3bc32f909ec4',
                      name: 'The Atlantic',
                      color: 'red',
                    },
                  },
                  Summary: {
                    id: '%3F%5C25',
                    type: 'rich_text',
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content:
                            'Some think chief ethics officers could help technology companies navigate political and social questions.',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text:
                          'Some think chief ethics officers could help technology companies navigate political and social questions.',
                        href: null,
                      },
                    ],
                  },
                  'Publishing/Release Date': {
                    id: '%3Fex%2B',
                    type: 'date',
                    date: {
                      start: '2020-12-08T12:00:00.000+00:00',
                      end: null,
                      time_zone: null,
                    },
                  },
                  date: {
                    id: 'Lpwp',
                    type: 'date',
                    date: null,
                  },
                  Link: {
                    id: 'VVMi',
                    type: 'url',
                    url: 'https://www.nytimes.com/2018/10/21/opinion/who-will-teach-silicon-valley-to-be-ethical.html',
                  },
                  'Wine Pairing': {
                    id: 'WO%40Z',
                    type: 'rich_text',
                    rich_text: [],
                  },
                  Read: {
                    id: '_MWJ',
                    type: 'checkbox',
                    checkbox: false,
                  },
                  Status: {
                    id: '%60zz5',
                    type: 'select',
                    select: {
                      id: '8c4a056e-6709-4dd1-ba58-d34d9480855a',
                      name: 'Ready to Start',
                      color: 'yellow',
                    },
                  },
                  Author: {
                    id: 'qNw_',
                    type: 'multi_select',
                    multi_select: [],
                  },
                  Name: {
                    id: 'title',
                    type: 'title',
                    title: [
                      {
                        type: 'text',
                        text: {
                          content: 'New Media Article',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text: 'New Media Article',
                        href: null,
                      },
                    ],
                  },
                },
                url: 'https://www.notion.so/New-Media-Article-dc2a9117163d4075907e604b2f04c504',
              },
              {
                object: 'page',
                id: 'c443c084-4637-4df2-ba37-b3c8a7e3d062',
                created_time: '2021-06-15T17:23:00.000Z',
                last_edited_time: '2021-06-15T17:23:00.000Z',
                created_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                last_edited_by: {
                  object: 'user',
                  id: '92a680bb-6970-4726-952b-4f4c03bff617',
                },
                cover: null,
                icon: null,
                parent: {
                  type: 'database_id',
                  database_id: '7a94f22f-59ae-484d-90ac-4aeddd667641',
                },
                archived: false,
                properties: {
                  'Score /5': {
                    id: ')Y7%22',
                    type: 'select',
                    select: {
                      id: '5c944de7-3f4b-4567-b3a1-fa2c71c540b6',
                      name: '⭐️⭐️⭐️⭐️⭐️',
                      color: 'default',
                    },
                  },
                  Type: {
                    id: '%2F7eo',
                    type: 'select',
                    select: {
                      id: 'f96d0d0a-5564-4a20-ab15-5f040d49759e',
                      name: 'Article',
                      color: 'default',
                    },
                  },
                  Publisher: {
                    id: '%3E%24Pb',
                    type: 'select',
                    select: {
                      id: '01f82d08-aa1f-4884-a4e0-3bc32f909ec4',
                      name: 'The Atlantic',
                      color: 'red',
                    },
                  },
                  Summary: {
                    id: '%3F%5C25',
                    type: 'rich_text',
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content:
                            'Some think chief ethics officers could help technology companies navigate political and social questions.',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text:
                          'Some think chief ethics officers could help technology companies navigate political and social questions.',
                        href: null,
                      },
                    ],
                  },
                  'Publishing/Release Date': {
                    id: '%3Fex%2B',
                    type: 'date',
                    date: {
                      start: '2020-12-08T12:00:00.000+00:00',
                      end: null,
                      time_zone: null,
                    },
                  },
                  date: {
                    id: 'Lpwp',
                    type: 'date',
                    date: null,
                  },
                  Link: {
                    id: 'VVMi',
                    type: 'url',
                    url: 'https://www.nytimes.com/2018/10/21/opinion/who-will-teach-silicon-valley-to-be-ethical.html',
                  },
                  'Wine Pairing': {
                    id: 'WO%40Z',
                    type: 'rich_text',
                    rich_text: [],
                  },
                  Read: {
                    id: '_MWJ',
                    type: 'checkbox',
                    checkbox: false,
                  },
                  Status: {
                    id: '%60zz5',
                    type: 'select',
                    select: {
                      id: '8c4a056e-6709-4dd1-ba58-d34d9480855a',
                      name: 'Ready to Start',
                      color: 'yellow',
                    },
                  },
                  Author: {
                    id: 'qNw_',
                    type: 'multi_select',
                    multi_select: [],
                  },
                  Name: {
                    id: 'title',
                    type: 'title',
                    title: [
                      {
                        type: 'text',
                        text: {
                          content: 'New Media Article',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text: 'New Media Article',
                        href: null,
                      },
                    ],
                  },
                },
                url: 'https://www.notion.so/New-Media-Article-c443c08446374df2ba37b3c8a7e3d062',
              },
            ],
          }),
        blocks: {
          children: {
            list: vi.fn().mockResolvedValue({
              type: 'block',
              block: {},
              object: 'list',
              next_cursor: null,
              has_more: false,
              results: [
                {
                  object: 'block',
                  id: 'abc12345-6789-0def-1234-567890abcdef',
                  parent: {
                    type: 'page_id',
                    page_id: 'page12345-6789-0def-1234-567890abcdef',
                  },
                  created_time: '2023-03-15T12:34:56.000Z',
                  last_edited_time: '2023-03-15T12:34:56.000Z',
                  has_children: false,
                  archived: false,
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [
                      {
                        type: 'text',
                        text: {
                          content: 'This is a paragraph block.',
                          link: null,
                        },
                        annotations: {
                          bold: false,
                          italic: false,
                          strikethrough: false,
                          underline: false,
                          code: false,
                          color: 'default',
                        },
                        plain_text: 'This is a paragraph block.',
                        href: null,
                      },
                    ],
                    color: 'default',
                  },
                },
              ],
            }),
          },
        },
      };
    }),
  };
});

describe('reads pages from notion', () => {
  const notion: Client = new Client({ auth: 'foo' });
  it('fetches notion pages', async () => {
    const { pages: page1 } = await fetchNextNotionPages(notion, null);
    expect(page1).length(2);

    const { pages: page2 } = await fetchNextNotionPages(notion, 'next-cursor');
    expect(page2).length(2);
  });
});

describe('reads and processes pages from notion', () => {
  const notion: Client = new Client({ auth: 'foo' });
  it('processes notion pages correctly', async () => {
    const { pages: allPages } = await fetchNextNotionPages(notion, null);
    expect(allPages).length(2);
    const processedPages = await processNotionPages(notion, allPages as []);
    expect(processedPages.some((page) => page.title === 'New Media Article')).toBe(true);
    expect(processedPages.some((page) => page.content.includes('This is a paragraph block.'))).toBe(
      true
    );
    expect(processedPages.some((page) => page.contentType === 'MARKDOWN')).toBe(true);
    expect(
      processedPages.some(
        (page) =>
          page.url === 'https://www.notion.so/New-Media-Article-ae1905c3b77b475bb98f7596c242137f'
      )
    ).toBe(true);
  });
});
