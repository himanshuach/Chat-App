import React from 'react';
import { Button } from '../components/common';
import './WelcomePage.css';

interface WelcomePageProps {
  onGetStarted?: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-content">
          <div className="welcome-icon">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="#25d366"
              />
            </svg>
          </div>
          
          <h1 className="welcome-title">Welcome to WhatsApp Clone</h1>
          
          <p className="welcome-description">
            Connect with friends and family. Send messages, share photos, and stay in touch with the people who matter most.
          </p>
          
          <div className="welcome-features">
            <div className="feature">
              <span className="feature-icon">💬</span>
              <span>Real-time messaging</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <span>Group chats</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>End-to-end encryption</span>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="large"
            onClick={onGetStarted}
            className="welcome-button"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
