// Trigger utilities for Maven AGI app hooks
// This file contains utilities for handling various app lifecycle triggers

export interface TriggerContext {
  organizationId: string;
  agentId: string;
  settings: AppSettings;
}

export interface RefreshContext extends TriggerContext {
  knowledgeBaseId?: string;
}

export async function handlePreInstall(context: TriggerContext): Promise<void> {
  console.log('Handling pre-install trigger', context);
  // Add any pre-install logic here
}

export async function handlePostInstall(context: TriggerContext): Promise<void> {
  console.log('Handling post-install trigger', context);
  // Add any post-install logic here
}

export async function handleKnowledgeBaseRefresh(context: RefreshContext): Promise<void> {
  console.log('Handling knowledge base refresh trigger', context);
  // Add any refresh logic here
}
