import React, { useState } from 'react';
import { Button, Input } from '../components/common';
import './AuthPage.css';

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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>WhatsApp Clone</h1>
          <p>Sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={setUsername}
              size="large"
            />
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            size="large"
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            size="large"
          />
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="auth-button"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="auth-footer">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="auth-toggle"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
