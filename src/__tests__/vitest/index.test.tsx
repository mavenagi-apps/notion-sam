import { KB_ID } from '@/utils/notion';
import * as notion from '@notionhq/client';
import { MavenAGIClient } from 'mavenagi';
import { SetupServerApi, setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import hooks from '../../index';

// Mock the notion utils
vi.mock('@/utils/notion', () => ({
  KB_ID: 'test-kb-id',
  fetchNotionPages: vi.fn().mockResolvedValue([{ id: 'page1' }]),
  processNotionPages: vi.fn().mockResolvedValue([
    {
      knowledgeDocumentId: { referenceId: 'doc1' },
      title: 'Test Page',
      content: 'Test Content',
      contentType: 'MARKDOWN',
    },
  ]),
}));

describe('Maven hooks', () => {
  let server: SetupServerApi;
  const mockSettings = {
    apiToken: 'test-token',
  };

  beforeAll(() => {
    server = setupServer();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    server.close();
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
      const mockKnowledge = {
        createOrUpdateKnowledgeBase: vi
          .fn()
          .mockResolvedValue({ knowledgeBaseId: { referenceId: KB_ID } }),
        createKnowledgeBaseVersion: vi.fn().mockResolvedValue({}),
        createKnowledgeDocument: vi.fn().mockResolvedValue({}),
        finalizeKnowledgeBaseVersion: vi.fn().mockResolvedValue({}),
      };

      vi.spyOn(MavenAGIClient.prototype, 'knowledge', 'get').mockReturnValue(
        mockKnowledge as unknown as MavenAGIClient['knowledge']
      );

      await hooks.postInstall({
        organizationId: 'org1',
        agentId: 'agent1',
        settings: mockSettings,
      });

      expect(mockKnowledge.createOrUpdateKnowledgeBase).toHaveBeenCalledWith({
        name: 'Notion Knowledge Base',
        type: 'API',
        knowledgeBaseId: { referenceId: KB_ID },
      });
      expect(mockKnowledge.createKnowledgeBaseVersion).toHaveBeenCalled();
      expect(mockKnowledge.createKnowledgeDocument).toHaveBeenCalled();
      expect(mockKnowledge.finalizeKnowledgeBaseVersion).toHaveBeenCalled();
    });
  });

  describe('knowledgeBaseRefreshed', () => {
    it('should refresh knowledge base with specified ID', async () => {
      const customKbId = 'custom-kb-id';
      const mockKnowledge = {
        createOrUpdateKnowledgeBase: vi
          .fn()
          .mockResolvedValue({ knowledgeBaseId: { referenceId: customKbId } }),
        createKnowledgeBaseVersion: vi.fn().mockResolvedValue({}),
        createKnowledgeDocument: vi.fn().mockResolvedValue({}),
        finalizeKnowledgeBaseVersion: vi.fn().mockResolvedValue({}),
      };

      vi.spyOn(MavenAGIClient.prototype, 'knowledge', 'get').mockReturnValue(
        mockKnowledge as unknown as MavenAGIClient['knowledge']
      );

      await hooks.knowledgeBaseRefreshed({
        organizationId: 'org1',
        agentId: 'agent1',
        knowledgeBaseId: { referenceId: customKbId },
        settings: mockSettings,
      });

      expect(mockKnowledge.createOrUpdateKnowledgeBase).toHaveBeenCalledWith({
        name: 'Notion Knowledge Base',
        type: 'API',
        knowledgeBaseId: { referenceId: customKbId },
      });
      expect(mockKnowledge.createKnowledgeDocument).toHaveBeenCalledWith(
        customKbId,
        expect.any(Object)
      );
    });
  });
});
