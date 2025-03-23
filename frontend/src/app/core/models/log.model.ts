export interface Log {
  id: string;
  resourceId?: string;
  resourceName?: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}