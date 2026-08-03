'use client';

import React from 'react';
import { PacmanLoader as ReactPacmanLoader } from 'react-spinners';

interface PacmanLoaderProps {
  size?: number;
  color?: string;
  speedMultiplier?: number;
  margin?: number;
}

export default function PacmanLoader({ 
  size = 30, 
  color = '#3b82f6', 
  speedMultiplier = 2,
  margin = 4 
}: PacmanLoaderProps) {
  return (
    <div className="flex justify-center items-center">
      <ReactPacmanLoader
        margin={margin}
        size={size}
        speedMultiplier={speedMultiplier}
        color={color}
      />
    </div>
  );
}
