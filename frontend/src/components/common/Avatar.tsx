import React from 'react';

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

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-14 h-14 text-lg',
  };

  const onlineIndicatorSizeClasses = {
    small: 'w-2 h-2 bottom-0 right-0',
    medium: 'w-3 h-3 bottom-0.5 right-0.5',
    large: 'w-4 h-4 bottom-1 right-1',
  };

  const renderAvatar = () => {
    if (src) {
      return <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />;
    }
    return <div className="font-semibold text-gray-600">{getInitials(alt)}</div>;
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center bg-gray-200 rounded-full cursor-pointer overflow-visible ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {renderAvatar()}
      {isOnline && <div className={`absolute rounded-full bg-green-500 border-2 border-white ${onlineIndicatorSizeClasses[size]}`} />}
    </div>
  );
};

export default Avatar; 