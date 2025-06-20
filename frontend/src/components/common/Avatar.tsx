import React from 'react';
import './Avatar.css';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  isOnline?: boolean;
  onClick?: () => void;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'medium',
  isOnline = false,
  onClick,
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAvatar = () => {
    if (src) {
      return <img src={src} alt={alt} className="avatar-image" />;
    }
    return <div className="avatar-initials">{getInitials(alt)}</div>;
  };

  return (
    <div 
      className={`avatar avatar-${size} ${className}`}
      onClick={onClick}
    >
      {renderAvatar()}
      {isOnline && <div className="avatar-online-indicator" />}
    </div>
  );
};

export default Avatar; 