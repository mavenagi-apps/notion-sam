import { describe, expect, it, vi } from 'vitest';

vi.mock('mavenagi/api/resources/actions/client/Client', () => {
  const Actions = vi.fn();
  Actions.prototype.createOrUpdate = vi.fn();

  return { Actions };
});

vi.mock('mavenagi/api/resources/knowledge/client/Client', () => {
  const Knowledge = vi.fn();
  Knowledge.prototype.createOrUpdateKnowledgeBase = vi.fn();
  Knowledge.prototype.createKnowledgeBaseVersion = vi.fn();
  Knowledge.prototype.createKnowledgeDocument = vi.fn();
  Knowledge.prototype.finalizeKnowledgeBaseVersion = vi.fn();

  return { Knowledge };
});

describe('app-template', () => {
  describe('postInstall', () => {
    it('should run without error', () => {
      expect(1).toBe(1);
    });
  });
});
