import { useContext } from 'react';
import { AdminUserContext } from './AdminUserContext';
import type { AdminUser } from './AdminUserContext';

interface AdminUserContextType {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
}

export const useAdminUser = (): AdminUserContextType => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context;
};
