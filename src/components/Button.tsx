'use client';

import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-container',
    destructive: 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container',
  };

  const sizes = {
    sm: 'px-md py-sm text-body-sm',
    md: 'px-lg py-md text-body-md',
    lg: 'px-xl py-lg text-body-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
