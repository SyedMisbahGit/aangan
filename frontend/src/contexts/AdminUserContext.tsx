import { createContext, useState, type ReactNode, type FC } from 'react';
import type { AdminUser, AdminUserContextType } from './types/adminUser.types';

export const AdminUserContext = createContext<AdminUserContextType | null>(null);

interface AdminUserProviderProps {
  children: ReactNode;
}

export const AdminUserProvider: FC<AdminUserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  
  const value = {
    user,
    setUser,
  };

  return (
    <AdminUserContext.Provider value={value}>
      {children}
    </AdminUserContext.Provider>
  );
};

export { AdminUserContext as default };
