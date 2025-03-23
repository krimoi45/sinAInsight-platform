export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}