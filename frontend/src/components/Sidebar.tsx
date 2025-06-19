import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div style={{ width: '250px', background: '#f4f4f4', height: '100vh', padding: '1rem', boxSizing: 'border-box' }}>
      <h2>Chats</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>User 1</li>
        <li>User 2</li>
        <li>User 3</li>
      </ul>
    </div>
  );
};

export default Sidebar; 