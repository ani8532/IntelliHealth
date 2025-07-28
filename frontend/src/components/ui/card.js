import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white shadow rounded-xl p-4">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="text-gray-800">{children}</div>
);
