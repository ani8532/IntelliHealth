import React from 'react';

export const Badge = ({ children, type = 'default' }) => {
  const base = 'inline-block px-2 py-1 text-xs font-semibold rounded-full';
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-200 text-yellow-800',
    error: 'bg-red-200 text-red-800',
    info: 'bg-blue-200 text-blue-800',
  };

  return <span className={`${base} ${variants[type]}`}>{children}</span>;
};
