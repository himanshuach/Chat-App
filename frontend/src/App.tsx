import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import WelcomePage from './pages/WelcomePage';
import Spinner from './components/common/Spinner'; // Assuming you have a Spinner component

import './App.css';

function App() {
  const { user, token, loading } = useAuth();

  // Show a loading spinner while the auth state is being determined
  if (loading) {
    return (
      <div className="fullscreen-spinner">
        <Spinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* The root path depends on authentication state */}
        <Route 
          path="/" 
          element={
            token ? <Navigate to="/chats" /> : <WelcomePage />
          } 
        />
        
        {/* Auth page - only accessible if not logged in */}
        <Route 
          path="/auth" 
          element={
            !token ? <AuthPage /> : <Navigate to="/chats" />
          } 
        />
        
        {/* Chat page - a protected route */}
        <Route 
          path="/chats" 
          element={
            token ? <ChatPage /> : <Navigate to="/auth" />
          } 
        />
        
        {/* Fallback route for any other path */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
