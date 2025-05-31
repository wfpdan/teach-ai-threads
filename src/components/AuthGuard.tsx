
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useMemberstack } from '@/hooks/useMemberstack';
import { User, LogIn } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading, login, isAuthenticated } = useMemberstack();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Teaching Assistant
            </h1>
            <p className="text-gray-600">
              Please sign in to access your personalized lesson planning dashboard
            </p>
          </div>

          <Button 
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            size="lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In with Memberstack
          </Button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure authentication powered by Memberstack
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
