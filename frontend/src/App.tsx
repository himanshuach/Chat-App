import React from 'react';
import Sidebar from './components/Sidebar';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
// import ProfileModal from './components/ProfileModal';
import './App.css';

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <UserList />
        <ChatWindow />
      </div>
      {/* <ProfileModal /> */}
    </div>
  );
}

export default App;
