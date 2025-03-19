import { inngest } from '@/inngest/client';
import * as notion from '@notionhq/client';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import hooks from '../../index';

describe('Maven hooks', () => {
  const mockSettings = {
    apiToken: 'test-token',
  };
  afterEach(() => {
    vi.resetAllMocks();
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('preInstall', () => {
    it('should validate Notion API token', async () => {
      const mockNotion = {
        search: vi.fn().mockResolvedValue({
          type: 'page_or_database',
          page_or_database: {},
          object: 'list',
          next_cursor: null,
          has_more: false,
          results: [],
        }),
      } as unknown as notion.Client;
      vi.spyOn(notion, 'Client').mockImplementation(() => mockNotion);
      await expect(
        hooks.preInstall({
          organizationId: 'org1',
          agentId: 'agent1',
          settings: mockSettings,
        })
      ).resolves.not.toThrow();
      expect(mockNotion.search).toHaveBeenCalled();
    });
  });

  describe('postInstall', () => {
    it('should ingest knowledge base successfully', async () => {
      const inngestSendMock = vi.spyOn(inngest, 'send').mockResolvedValue({ ids: [] });
      await hooks.postInstall({
        organizationId: 'org1',
        agentId: 'agent1',
        settings: mockSettings,
      });
      expect(inngestSendMock).toHaveBeenCalledWith({
        name: 'app/notion/ingest-knowledge-base',
        id: 'ingest-knowledge-base-org1-agent1',
        data: {
          organizationId: 'org1',
          agentId: 'agent1',
          settings: mockSettings,
        },
      });
    });
  });

  describe('knowledgeBaseRefreshed', () => {
    it('should refresh knowledge base with specified ID', async () => {
      const inngestSendMock = vi.spyOn(inngest, 'send').mockResolvedValue({ ids: [] });
      const customKbId = 'custom-kb-id';

      await hooks.knowledgeBaseRefreshed({
        organizationId: 'org1',
        agentId: 'agent1',
        knowledgeBaseId: { referenceId: customKbId },
        settings: mockSettings,
      });

      expect(inngestSendMock).toHaveBeenCalledWith({
        name: 'app/notion/ingest-knowledge-base',
        id: 'ingest-knowledge-base-org1-agent1',
        data: {
          organizationId: 'org1',
          agentId: 'agent1',
          settings: mockSettings,
          knowledgeBaseId: customKbId,
        },
      });
    });
  });
});
