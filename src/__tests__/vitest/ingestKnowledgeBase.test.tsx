import { inngest } from '@/inngest/client';
import { ingestKnowledgeBase } from '@/lib';
import { KB_ID } from '@/utils/notion';
import { BaseContext } from 'inngest';
import { MavenAGIClient } from 'mavenagi';
import { describe, expect, it, vi } from 'vitest';

// Mock the notion utils
vi.mock('@/utils/notion', () => ({
  KB_ID: 'test-kb-id',
  fetchNextNotionPages: vi.fn().mockResolvedValue({
    pages: [{ id: 'page1', properties: [{ type: 'title', title: [{ plain_text: 'title' }] }] }],
  }),
  fetchNotionPageMarkdown: vi.fn().mockResolvedValue('Test Content'),
}));

describe('ingestKnowledgeBase', () => {
  const mockSettings = {
    apiToken: 'test-token',
  };

  const inngestStepMock = {
    run: vi.fn().mockImplementation(async (name, fn, ...args) => {
      console.log(`Running step: ${name}`);
      return await fn(...args);
    }),
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
      step: inngestStepMock as unknown as BaseContext<typeof inngest>['step'],
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
      step: inngestStepMock as unknown as BaseContext<typeof inngest>['step'],
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
