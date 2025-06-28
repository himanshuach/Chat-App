import React from 'react';
import { X } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0,0,0,0.3)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: '#fff', 
          padding: '2rem', 
          borderRadius: '8px', 
          minWidth: '300px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-3">
          <p><strong>Name:</strong> User</p>
          <p><strong>Email:</strong> user@example.com</p>
          <p><strong>Status:</strong> Online</p>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => {
              // TODO: Implement edit profile
              console.log('Edit profile clicked');
            }}
          >
            Edit Profile
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 