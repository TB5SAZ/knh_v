export type UserRole = 'admin' | 'secretary' | 'security';

export interface Profile {
  id: string;
  tc_kimlik: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id?: string;
  phone?: string;
  is_active: boolean;
}
