
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
        console.log('Available methods on memberstack:', Object.getOwnPropertyNames(ms));
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
    console.log('Memberstack type:', typeof memberstack);
    
    if (!memberstack) {
      console.error('Memberstack not initialized');
      return;
    }
    
    try {
      console.log('About to call openModal...');
      console.log('openModal method exists:', typeof memberstack.openModal);
      
      // Try different approaches to open the modal
      let result;
      
      if (typeof memberstack.openModal === 'function') {
        console.log('Calling openModal with SIGNUP_SIGNIN type...');
        result = await memberstack.openModal({ type: 'SIGNUP_SIGNIN' });
      } else if (typeof memberstack.open === 'function') {
        console.log('Trying alternative open method...');
        result = await memberstack.open();
      } else {
        console.log('Available methods:', Object.getOwnPropertyNames(memberstack));
        throw new Error('No modal opening method found');
      }
      
      console.log('Modal result:', result);
      
      // Wait a bit for the auth state to update
      setTimeout(async () => {
        try {
          console.log('Checking for user after modal...');
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
