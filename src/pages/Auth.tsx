
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isRedirecting) {
      console.log('Auth: User detected, redirecting to main app');
      setIsRedirecting(true);
      setLoading(false);
      setError('');
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [user, navigate, isRedirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        console.log('Auth: Authentication error:', error.message);
        setError(error.message);
        setLoading(false);
      } else if (isSignUp) {
        setError('Check your email for the confirmation link!');
        setLoading(false);
      }
    } catch (err) {
      console.error('Auth: Unexpected error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center fixed inset-0 overflow-hidden">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background fixed inset-0 overflow-hidden">
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-12">
              <span className="text-blue-500">ColdCall </span>
              <span className="text-blue-500">X</span>
            </h1>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-8">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="h-14 text-lg rounded-2xl border-2 focus:border-blue-500 transition-colors text-center placeholder:text-center"
                disabled={loading}
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="h-14 text-lg rounded-2xl border-2 focus:border-blue-500 transition-colors text-center placeholder:text-center"
                disabled={loading}
              />
              
              {error && (
                <Alert className="rounded-2xl border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-center">{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold rounded-2xl bg-blue-500 hover:bg-blue-600 transition-colors" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-muted-foreground hover:text-foreground text-base"
                disabled={loading}
              >
                {isSignUp ? 'Already have an account?' : 'Create account'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
