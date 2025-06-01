
import { useEffect, useState } from 'react';

interface MemberstackUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const useMemberstack = () => {
  // Mock user for testing purposes
  const mockUser: MemberstackUser = {
    id: 'test-user-123',
    email: 'teacher@test.com',
    firstName: 'Test',
    lastName: 'Teacher'
  };

  const [user] = useState<MemberstackUser | null>(mockUser);
  const [isLoading] = useState(false);

  const login = async () => {
    console.log('Login bypassed for testing');
  };

  const logout = async () => {
    console.log('Logout bypassed for testing');
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: true
  };
};
