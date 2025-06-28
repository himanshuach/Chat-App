import React, { useState } from 'react';
import { Button, Input } from '../components/common';
import { Mail, Key, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          return;
        }
        await register(username, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-600 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Chitchat</h1>
          <p className="text-gray-500">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={setUsername}
              size="large"
              icon={<UserIcon size={18} className="text-gray-400" />}
              disabled={isLoading}
            />
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            size="large"
            icon={<Mail size={18} className="text-gray-400" />}
            disabled={isLoading}
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            size="large"
            icon={<Key size={18} className="text-gray-400" />}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="mt-2 w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>
        
        <div className="mt-6 border-t pt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="w-full !text-blue-600 hover:!bg-blue-50"
            disabled={isLoading}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
