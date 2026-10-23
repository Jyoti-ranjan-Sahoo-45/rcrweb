import React from 'react';
import logoImg from '../assets/logo.png';

export const BrandLogo = ({
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showText = false,
  theme = 'dark',
  className = '',
}) => {
  const heightMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const currentHeight = heightMap[size] || heightMap.md;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="RCR FINANCE NBFC - Digital Lending Platform"
        className={`${currentHeight} w-auto max-w-[240px] sm:max-w-[320px] object-contain pointer-events-none transition-transform duration-200 hover:scale-[1.02]`}
        onError={(e) => {
          e.target.src = '/logo.png';
        }}
      />
    </div>
  );
};
