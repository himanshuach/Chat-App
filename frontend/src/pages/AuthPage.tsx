import React, { useState } from 'react';
import { Button, Input } from '../components/common';
import { Mail, Key, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  onLogin?: (email: string, password: string) => void;
  onRegister?: (username: string, email: string, password: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin?.(email, password);
    } else {
      onRegister?.(username, email, password);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-600 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">WhatsApp Clone</h1>
          <p className="text-gray-500">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={setUsername}
              size="large"
              icon={<UserIcon size={18} className="text-gray-400" />}
            />
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            size="large"
            icon={<Mail size={18} className="text-gray-400" />}
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            size="large"
            icon={<Key size={18} className="text-gray-400" />}
          />
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="mt-2 w-full"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 border-t pt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full !text-blue-600 hover:!bg-green-50"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
