import { createContext, useState, type ReactNode, type FC, useContext } from 'react';

export interface AdminUser {
  username: string;
  role: string;
}

export interface AdminUserContextType {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
}

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

export const useAdminUser = (): AdminUserContextType => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context;
};

export default AdminUserContext;
