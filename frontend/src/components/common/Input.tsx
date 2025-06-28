import React, { forwardRef } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  error?: string;
  size?: 'small' | 'medium' | 'large';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  className = '',
  icon,
  error,
  size = 'medium'
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const baseClasses = 'w-full rounded-lg border bg-white text-gray-800 transition-all focus:outline-none focus:ring-2';
  const stateClasses = error 
    ? 'border-red-500 focus:ring-red-400' 
    : 'border-gray-300 focus:ring-blue-500';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs h-8',
    medium: 'px-4 py-2 text-sm h-10',
    large: 'px-6 py-3 text-base h-12',
  };

  const iconPaddingClass = icon ? (size === 'small' ? 'pl-9' : 'pl-11') : '';
  const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed';

  return (
    <div className={`relative w-full ${className}`}>
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          ${baseClasses} 
          ${stateClasses} 
          ${sizeClasses[size]}
          ${iconPaddingClass}
          ${disabled ? disabledClasses : ''}
        `}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
      />
      {error && <div className="mt-1 ml-1 text-xs text-red-600">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 