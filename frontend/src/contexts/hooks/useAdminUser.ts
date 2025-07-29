import { useContext } from 'react';
import { AdminUserContext } from '../AdminUserContext';
import type { AdminUserContextType } from '../types/adminUser.types';

export const useAdminUser = (): AdminUserContextType => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context;
};

export default useAdminUser;
