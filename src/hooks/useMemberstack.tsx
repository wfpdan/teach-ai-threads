
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
        console.log('Initializing Memberstack...');
        const ms = Memberstack.init({
          publicKey: import.meta.env.VITE_MEMBERSTACK_PUBLIC_KEY || 'pk_c69b36ba4054b2e02bf3'
        });

        console.log('Memberstack initialized:', ms);
        setMemberstack(ms);

        // Check if user is already logged in
        console.log('Checking for existing user...');
        const currentUser = await ms.getCurrentMember();
        console.log('Current user check result:', currentUser);
        
        if (currentUser?.data) {
          console.log('Found existing user:', currentUser.data);
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
    console.log('=== LOGIN FUNCTION CALLED ===');
    console.log('Login button clicked, memberstack:', memberstack);
    
    if (!memberstack) {
      console.error('Memberstack not initialized');
      return;
    }
    
    try {
      console.log('Attempting to open Memberstack modal...');
      
      // Call openModal without any parameters - this is the correct way
      console.log('Calling openModal() without parameters...');
      const result = await memberstack.openModal();
      console.log('OpenModal result:', result);
      
      // Wait for potential auth state changes
      setTimeout(async () => {
        try {
          console.log('Checking for user after modal interaction...');
          const currentUser = await memberstack.getCurrentMember();
          console.log('User check after modal:', currentUser);
          
          if (currentUser?.data) {
            console.log('Setting user from login:', currentUser.data);
            setUser({
              id: currentUser.data.id,
              email: currentUser.data.auth?.email || '',
              firstName: (currentUser.data.customFields as any)?.firstName,
              lastName: (currentUser.data.customFields as any)?.lastName
            });
          }
        } catch (error) {
          console.error('Error checking user after login:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error details:', error.message, error.stack);
    }
  };

  const logout = async () => {
    if (!memberstack) return;
    try {
      console.log('Logging out...');
      await memberstack.logout();
      setUser(null);
      console.log('Logout successful');
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
