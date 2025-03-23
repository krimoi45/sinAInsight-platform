export interface Screenshot {
  id: string;
  resourceId: string;
  resourceName: string;
  stepName?: string;
  path: string;
  timestamp: string;
  status?: 'success' | 'error' | 'warning';
  metadata?: {
    width?: number;
    height?: number;
    browser?: string;
    viewport?: string;
    url?: string;
    [key: string]: any;
  };
}