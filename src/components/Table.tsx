'use client';

import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>{children}</table>
    </div>
  );
}

export function TableHead({ children, className }: TableProps) {
  return <thead className={`bg-gray-50 border-b border-gray-200 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return <tr className={`border-b border-gray-200 hover:bg-gray-50 ${className}`}>{children}</tr>;
}

export function TableHeader({ children, className }: TableProps) {
  return <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>;
}

export function TableCell({ children, className }: TableProps) {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>{children}</td>;
}
