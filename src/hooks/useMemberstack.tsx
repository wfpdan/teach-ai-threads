
import { useEffect, useState } from 'react';
import Memberstack from '@memberstack/dom';

interface MemberstackUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const useMemberstack = () => {
  const [user, setUser] = useState<MemberstackUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberstack, setMemberstack] = useState<any>(null);

  useEffect(() => {
    const initMemberstack = async () => {
      try {
        const ms = Memberstack.init({
          publicKey: import.meta.env.VITE_MEMBERSTACK_PUBLIC_KEY || 'pk_c69b36ba4054b2e02bf3'
        });

        setMemberstack(ms);

        // Check if user is already logged in
        const currentUser = await ms.getCurrentMember();
        if (currentUser?.data) {
          setUser({
            id: currentUser.data.id,
            email: currentUser.data.auth?.email || '',
            firstName: (currentUser.data.customFields as any)?.firstName,
            lastName: (currentUser.data.customFields as any)?.lastName
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Memberstack:', error);
        setIsLoading(false);
      }
    };

    initMemberstack();
  }, []);

  const login = async () => {
    if (!memberstack) return;
    try {
      const result = await memberstack.openModal();
      console.log('Login result:', result);
      
      // After successful login, get the current member
      if (result?.data) {
        const currentUser = await memberstack.getCurrentMember();
        if (currentUser?.data) {
          setUser({
            id: currentUser.data.id,
            email: currentUser.data.auth?.email || '',
            firstName: (currentUser.data.customFields as any)?.firstName,
            lastName: (currentUser.data.customFields as any)?.lastName
          });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    if (!memberstack) return;
    try {
      await memberstack.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
