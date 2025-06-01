
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
        
        // Get the public key from environment or use fallback
        const publicKey = import.meta.env.VITE_MEMBERSTACK_PUBLIC_KEY;
        console.log('Using public key:', publicKey ? 'Set from environment' : 'Using fallback');
        
        if (!publicKey) {
          console.error('No Memberstack public key found in environment variables');
          setIsLoading(false);
          return;
        }

        const ms = Memberstack.init({
          publicKey: publicKey
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
      
      // First, check if the openModal function exists and what it expects
      console.log('openModal function:', typeof memberstack.openModal);
      console.log('Memberstack object keys:', Object.keys(memberstack));
      
      // Try to open the modal with proper error handling
      console.log('Calling openModal()...');
      const result = await memberstack.openModal();
      console.log('OpenModal result:', result);
      
      // Check if modal opened successfully
      if (result && result.type !== 'CLOSED') {
        console.log('Modal opened successfully');
      } else {
        console.log('Modal was closed or failed to open');
      }
      
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
      
      // If openModal fails, try to redirect to Memberstack hosted pages
      console.log('Attempting fallback login method...');
      try {
        // Create a manual redirect to Memberstack login page
        const publicKey = import.meta.env.VITE_MEMBERSTACK_PUBLIC_KEY;
        if (publicKey) {
          const loginUrl = `https://app.memberstack.com/login?publicKey=${publicKey}&redirectUrl=${encodeURIComponent(window.location.href)}`;
          console.log('Redirecting to:', loginUrl);
          window.location.href = loginUrl;
        }
      } catch (fallbackError) {
        console.error('Fallback login method also failed:', fallbackError);
      }
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
