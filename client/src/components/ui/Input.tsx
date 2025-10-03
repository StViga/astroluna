import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InputProps } from '@/types/common';

// Utility function to merge classes
const cn = (...classes: (string | undefined | false | null)[]) => {
  return twMerge(clsx(classes.filter(Boolean)));
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      defaultValue,
      disabled = false,
      required = false,
      className,
      error,
      label,
      helperText,
      startIcon,
      endIcon,
      onChange,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'block w-full rounded-lg border px-3 py-2.5 text-sm',
      'placeholder-gray-400',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    ];

    const stateClasses = error
      ? [
          'border-error-300 text-error-900',
          'focus:border-error-500 focus:ring-error-500',
        ]
      : [
          'border-gray-300 text-gray-900',
          'focus:border-primary-500 focus:ring-primary-500',
          'hover:border-gray-400',
        ];

    const paddingClasses = cn(
      startIcon && 'pl-10',
      endIcon && 'pr-10'
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className={cn(
                'text-gray-400',
                error && 'text-error-400'
              )}>
                {startIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            className={cn(
              baseClasses,
              stateClasses,
              paddingClasses,
              className
            )}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className={cn(
                'text-gray-400',
                error && 'text-error-400'
              )}>
                {endIcon}
              </div>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="mt-1.5">
            {error && (
              <p className="text-sm text-error-600" role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;