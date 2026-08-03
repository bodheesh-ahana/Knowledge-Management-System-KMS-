'use client';

import React from 'react';

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function WaveLoader({ size = 'lg', color = '#3b82f6' }: WaveLoaderProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-60 h-60',
  };

  const coreSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const middleSize = {
    sm: '60%',
    md: '70%',
    lg: '70%',
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex flex-col justify-center items-center`}>
      {/* Outer Ring */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-full border-transparent"
        style={{
          borderWidth: '3px',
          borderTopColor: color,
          borderBottomColor: `${color}99`,
          animation: 'spin 3s linear infinite, morph 4s ease-in-out infinite alternate',
        }}
      />

      {/* Middle Ring */}
      <div
        className="absolute rounded-full border-transparent"
        style={{
          top: '15%',
          left: '15%',
          width: middleSize[size],
          height: middleSize[size],
          borderWidth: '3px',
          borderLeftColor: `${color}CC`,
          borderRightColor: `${color}66`,
          animation: 'spin-reverse 2s linear infinite, morph-reverse 3s ease-in-out infinite alternate',
        }}
      />

      {/* Inner Core */}
      <div
        className={`absolute ${coreSize[size]} rounded-full`}
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          boxShadow: `0 0 20px ${color}66, 0 0 40px ${color}33`,
          animation: 'pulse 1.5s ease-in-out infinite alternate',
        }}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes morph {
          0% { border-radius: 50%; }
          50% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          100% { border-radius: 50%; }
        }

        @keyframes morph-reverse {
          0% { border-radius: 50%; }
          50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          100% { border-radius: 50%; }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
          }
          100% {
            transform: scale(1.2);
            box-shadow: 0 0 30px rgba(0, 242, 254, 0.9), 0 0 50px rgba(79, 172, 254, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
