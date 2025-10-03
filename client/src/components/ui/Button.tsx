import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ButtonProps } from '@/types/common';

// Utility function to merge classes
const cn = (...classes: (string | undefined)[]) => {
  return twMerge(clsx(classes));
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none',
  ];

  const variantClasses = {
    primary: [
      'bg-gradient-cosmic text-white shadow-md hover:shadow-lg',
      'focus:ring-primary-500',
      'hover:opacity-90 active:scale-95',
      'disabled:hover:opacity-50 disabled:active:scale-100',
    ],
    secondary: [
      'bg-white text-gray-900 border border-gray-300 shadow-sm',
      'hover:bg-gray-50 hover:border-gray-400',
      'focus:ring-gray-500',
      'active:bg-gray-100',
    ],
    outline: [
      'border-2 border-primary-500 text-primary-600 bg-transparent',
      'hover:bg-primary-50 hover:text-primary-700',
      'focus:ring-primary-500',
      'active:bg-primary-100',
    ],
    ghost: [
      'text-gray-600 bg-transparent hover:bg-gray-100',
      'focus:ring-gray-500',
      'active:bg-gray-200',
    ],
    danger: [
      'bg-error-600 text-white shadow-md hover:shadow-lg',
      'hover:bg-error-700',
      'focus:ring-error-500',
      'active:bg-error-800',
    ],
    success: [
      'bg-success-600 text-white shadow-md hover:shadow-lg',
      'hover:bg-success-700',
      'focus:ring-success-500',
      'active:bg-success-800',
    ],
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className={cn(
            'animate-spin mr-2',
            size === 'xs' ? 'h-3 w-3' :
            size === 'sm' ? 'h-4 w-4' :
            size === 'lg' ? 'h-5 w-5' :
            size === 'xl' ? 'h-6 w-6' : 'h-4 w-4'
          )}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v8H4z"
          />
        </svg>
      )}
      
      {children}
    </button>
  );
};

export default Button;