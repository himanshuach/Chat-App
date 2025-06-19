import React from 'react';

const ChatWindow: React.FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', padding: '1rem', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', background: '#fff', borderRadius: '8px', padding: '1rem' }}>
        <div><b>User 1:</b> Hello!</div>
        <div><b>You:</b> Hi there!</div>
      </div>
      <input type="text" placeholder="Type a message..." style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
    </div>
  );
};

export default ChatWindow; 