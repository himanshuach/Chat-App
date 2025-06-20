import React from 'react';

const UserList: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Users</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>Online User 1</li>
        <li>Online User 2</li>
      </ul>
    </div>
  );
};

export default UserList; 