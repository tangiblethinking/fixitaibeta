'use client';

import React from 'react';

// ── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-button shadow-button active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary:
      'bg-surface-raised text-ink-800 border border-ink-200 hover:bg-ink-50',
    ghost: 'text-ink-600 hover:bg-ink-100 shadow-none',
    danger: 'bg-danger text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-body-sm',
    md: 'px-5 py-2.5 text-body min-h-[44px]',
    lg: 'px-6 py-3.5 text-body min-h-[48px] w-full',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-body-sm font-medium text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 rounded-input border text-body text-ink-900 placeholder:text-ink-400 transition-colors min-h-[44px] ${
          error
            ? 'border-danger bg-danger-light focus:ring-danger'
            : 'border-ink-200 bg-surface-raised focus:border-brand-400 focus:ring-brand-400'
        } focus:outline-none focus:ring-2 focus:ring-offset-1 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-body-sm text-danger">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-body-sm text-ink-400">{helperText}</p>
      )}
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-surface-raised rounded-card shadow-card p-5 ${
        onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ── Processing Indicator ────────────────────────────────────────────────────

export function ProcessingIndicator({ message = 'Analyzing...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-body-sm text-ink-500">{message}</span>
    </div>
  );
}
