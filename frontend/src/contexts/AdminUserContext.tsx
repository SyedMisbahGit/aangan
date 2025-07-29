import { createContext, useContext, useState, type ReactNode, type FC } from 'react';

export interface AdminUser {
  username: string;
  role: string;
}

interface AdminUserContextType {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
}

const AdminUserContext = createContext<AdminUserContextType | null>(null);

export const useAdminUser = (): AdminUserContextType => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context;
};

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

export default AdminUserContext;
