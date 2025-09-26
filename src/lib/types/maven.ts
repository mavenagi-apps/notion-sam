// Maven AGI specific type definitions

export interface MavenKnowledgeBase {
  knowledgeBaseId: {
    referenceId: string;
  };
  name: string;
  type: string;
}

export interface MavenKnowledgeDocument {
  knowledgeDocumentId: {
    referenceId: string;
  };
  title: string;
  content: string;
  contentType: 'MARKDOWN' | 'HTML' | 'TEXT';
  url?: string;
}

export interface MavenKnowledgeBaseVersion {
  versionId: {
    type: string;
    referenceId: string;
    appId: string;
    agentId: string;
    organizationId: string;
  };
  status: string;
  type: string;
}

export interface MavenConnectorConfig {
  organizationId: string;
  agentId: string;
  settings: AppSettings;
  lastSync?: string;
  syncStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
}
