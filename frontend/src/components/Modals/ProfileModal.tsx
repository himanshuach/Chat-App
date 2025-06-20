import React from 'react';

const ProfileModal: React.FC = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', minWidth: '300px' }}>
        <h2>Profile</h2>
        <p>Name: User</p>
        <button>Close</button>
      </div>
    </div>
  );
};

export default ProfileModal; 