import React from 'react';

interface LogoKotaBitungProps {
  className?: string;
  size?: number;
}

export const LogoKotaBitung: React.FC<LogoKotaBitungProps> = ({
  className = 'w-10 h-12',
}) => {
  return (
    <img
      src="/logo_kota_bitung.svg"
      alt="Logo Kota Bitung"
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
