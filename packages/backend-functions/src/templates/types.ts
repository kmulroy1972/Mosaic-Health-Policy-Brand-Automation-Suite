export interface TemplateItem {
  id: string;
  name: string;
  type: 'dotx' | 'potx';
  thumbnailUrl: string;
  driveId: string;
  itemId: string;
  etag: string;
}

export interface TemplateResponse {
  items: TemplateItem[];
}
