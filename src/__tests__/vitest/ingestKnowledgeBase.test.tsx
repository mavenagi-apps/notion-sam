import { ingestKnowledgeBase } from '@/lib';
import { KB_ID } from '@/utils/notion';
import { MavenAGIClient } from 'mavenagi';
import { describe, expect, it, vi } from 'vitest';

// Mock the notion utils
vi.mock('@/utils/notion', () => ({
  KB_ID: 'test-kb-id',
  fetchNotionPages: vi.fn().mockImplementation(async function* () {
    yield [{ id: 'page1' }];
  }),
  processNotionPages: vi.fn().mockResolvedValue([
    {
      knowledgeDocumentId: { referenceId: 'doc1' },
      title: 'Test Page',
      content: 'Test Content',
      contentType: 'MARKDOWN',
    },
  ]),
}));

describe('ingestKnowledgeBase', () => {
  const mockSettings = {
    apiToken: 'test-token',
  };

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

    await ingestKnowledgeBase({
      client: new MavenAGIClient({ agentId: 'agent1', organizationId: 'org1' }),
      apiToken: mockSettings.apiToken,
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

    await ingestKnowledgeBase({
      client: new MavenAGIClient({ agentId: 'agent1', organizationId: 'org1' }),
      apiToken: mockSettings.apiToken,
      knowledgeBaseId: customKbId,
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
