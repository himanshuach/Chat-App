import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-5',
  };

  return (
    <div className={`flex justify-center items-center h-full ${className}`}>
      <div 
        className={`animate-spin rounded-full border-solid border-green-500 border-t-transparent ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Spinner; 