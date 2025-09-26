// Notion-specific type definitions

export interface NotionPageInfo {
  id: string;
  title?: string;
  url: string;
  lastEditedTime?: string;
  createdTime?: string;
}

export interface NotionSearchResponse {
  object: 'list';
  results: NotionPageInfo[];
  next_cursor?: string;
  has_more: boolean;
}

export interface NotionPageContent {
  id: string;
  content: string;
  title: string;
  url: string;
}

export interface NotionApiError {
  object: 'error';
  status: number;
  code: string;
  message: string;
}
