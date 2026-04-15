import React, { useMemo } from 'react';
import { Badge, BadgeText } from './badge';

export type CustomBadgeProps = {
  count?: number;
  variant?: 'solid' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function CustomBadge({
  count,
  variant = 'solid',
  size = 'md',
  className = '',
}: CustomBadgeProps) {
  const isDot = variant === 'dot';
  
  // Logic for overflow depending on size (md is 9+, others are 99+)
  const threshold = size === 'md' ? 9 : 99;
  const displayCount = count !== undefined && count > threshold ? `${threshold}+` : count?.toString() || '';
  const isOverflow = count !== undefined && count > threshold;

  // Base dimensions and text sizes
  const styles = useMemo(() => {
    if (isDot) {
      // Dot variant uses absolute width/height
      if (size === 'sm') return { wrapper: 'w-2 h-2', text: '' };
      if (size === 'md') return { wrapper: 'w-3 h-3', text: '' };
      if (size === 'lg') return { wrapper: 'w-4 h-4', text: '' };
    } else {
      // Solid variant uses min-width to accommodate text and becomes pill-shaped
      const overflowPadding = isOverflow ? 'px-1.5' : 'px-0'; // Add horizontal padding for 99+
      
      if (size === 'sm') {
        return { wrapper: `min-w-4 h-4 ${overflowPadding}`, text: 'text-[9px] leading-[9px]' };
      }
      if (size === 'md') {
        return { wrapper: `min-w-5 h-5 ${overflowPadding}`, text: 'text-[11px] leading-[11px]' };
      }
      if (size === 'lg') {
        return { wrapper: `min-w-6 h-6 ${overflowPadding}`, text: 'text-[13px] leading-[13px]' };
      }
    }
    return { wrapper: '', text: '' };
  }, [isDot, size, isOverflow]);

  const badgeClasses = `bg-teal-500 items-center justify-center border-0 rounded-full p-0 flex flex-row ${styles.wrapper} ${className}`;

  return (
    <Badge
      action="muted" // Bypass any default gluestack semantic colored borders
      variant="solid" 
      className={badgeClasses}
    >
      {!isDot && (
        <BadgeText className={`text-white font-bold text-center ${styles.text}`}>
          {displayCount}
        </BadgeText>
      )}
    </Badge>
  );
}
