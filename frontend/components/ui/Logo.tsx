'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export function Logo({ className, variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="w-8 h-8 bg-gradient-to-br from-maldives-blue to-maldives-turquoise rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="w-8 h-8 bg-gradient-to-br from-maldives-blue to-maldives-turquoise rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">M</span>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-none">Maldives</span>
        <span className="text-sm font-medium leading-none opacity-80">Hotels</span>
      </div>
    </div>
  );
}