
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  // Bypass authentication for testing - always render children
  return <>{children}</>;
};
