export interface AdminUser {
  username: string;
  role: string;
}

export interface AdminUserContextType {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
}
