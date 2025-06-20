import React, { forwardRef } from 'react';
import './Input.css';

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

  return (
    <div className={`input-container ${className}`}>
      {icon && <div className="input-icon">{icon}</div>}
      <input
        ref={ref}
        type={type}
        className={`input input-${size} ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
      />
      {error && <div className="input-error-message">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 