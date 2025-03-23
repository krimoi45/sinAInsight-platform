export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  resourceId?: string;
  resourceName?: string;
  clientName?: string;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}