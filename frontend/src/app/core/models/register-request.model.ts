export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
}