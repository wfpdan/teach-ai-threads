
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
      
      // Try different modal opening approaches
      let result;
      
      // Method 1: Try with no parameters (default behavior)
      if (typeof memberstack.openModal === 'function') {
        console.log('Trying openModal() with no parameters...');
        result = await memberstack.openModal();
        console.log('Result from openModal():', result);
        
        // If that didn't work, try with explicit parameters
        if (!result || result.type === 'CLOSED') {
          console.log('First attempt failed, trying with SIGNUP parameter...');
          result = await memberstack.openModal('SIGNUP');
          console.log('Result from openModal(SIGNUP):', result);
        }
        
        // If still not working, try LOGIN
        if (!result || result.type === 'CLOSED') {
          console.log('Second attempt failed, trying with LOGIN parameter...');
          result = await memberstack.openModal('LOGIN');
          console.log('Result from openModal(LOGIN):', result);
        }
      }
      
      // Method 2: Try alternative approaches if openModal doesn't work
      if (!result || result.type === 'CLOSED') {
        console.log('All openModal attempts failed, checking for alternative methods...');
        console.log('Available methods:', Object.getOwnPropertyNames(memberstack));
        
        // Check if there's a different method to open auth
        if (typeof memberstack.showModal === 'function') {
          console.log('Trying showModal...');
          result = await memberstack.showModal();
        } else if (typeof memberstack.open === 'function') {
          console.log('Trying open...');
          result = await memberstack.open();
        } else if (typeof memberstack.auth === 'object' && typeof memberstack.auth.open === 'function') {
          console.log('Trying auth.open...');
          result = await memberstack.auth.open();
        }
      }
      
      console.log('Final modal result:', result);
      
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
