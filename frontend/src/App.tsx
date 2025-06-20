import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import UserList from './components/Sidebar/UserList';
import ProfileModal from './components/Modals/ProfileModal';

import './App.css';
import ChatWindow from './components/Chat/ChatWindow';

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <UserList />
        <ChatWindow />
      </div>
      <ProfileModal />
    </div>
  );
}

export default App;
