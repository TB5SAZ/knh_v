import React from 'react';
import { Pressable, Text } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { LucideIcon } from 'lucide-react-native';

const tableActionBadgeStyle = tva({
  base: 'flex-row items-center justify-center rounded-full active:opacity-70 transition-opacity',
  variants: {
    actionType: {
      neutral: 'bg-bg-surface',
      warning: 'bg-status-warning-bg',
      error: 'bg-status-error-bg',
    },
    theme: {
      soft: '',
      solid: '',
    },
    hasLabel: {
      true: 'px-[12px] py-[6px] gap-[8px]',
      false: 'w-[32px] h-[32px]',
    },
  },
  compoundVariants: [
    { actionType: 'neutral', theme: 'solid', class: 'bg-[#4b5563]' },
    { actionType: 'warning', theme: 'solid', class: 'bg-[#eab308]' },
    { actionType: 'error', theme: 'solid', class: 'bg-[#ef4444]' },
  ],
  defaultVariants: {
    actionType: 'neutral',
    theme: 'soft',
    hasLabel: false,
  },
});

const iconTextStyle = tva({
  base: 'text-[11px] font-medium',
  variants: {
    actionType: {
      neutral: 'text-text-secondary',
      warning: 'text-status-warning-text',
      error: 'text-status-error-text',
    },
    theme: {
      soft: '',
      solid: 'text-white',
    }
  },
  defaultVariants: {
    actionType: 'neutral',
    theme: 'soft',
  },
});

export type TableActionBadgeProps = {
  icon: LucideIcon;
  label?: string;
  actionType?: 'neutral' | 'warning' | 'error';
  theme?: 'soft' | 'solid';
  onPress?: () => void;
  className?: string;
  iconSize?: number;
};

export const TableActionBadge = ({
  icon: Icon,
  label,
  actionType = 'neutral',
  theme = 'soft',
  onPress,
  className,
  iconSize = 14,
}: TableActionBadgeProps) => {
  const hasLabel = !!label;

  return (
    <Pressable
      className={tableActionBadgeStyle({ actionType, theme, hasLabel, class: className })}
      onPress={onPress}
    >
      <Icon size={iconSize} className={iconTextStyle({ actionType, theme }) as any} />
      {hasLabel && (
        // @ts-ignore NativeWind className
        <Text className={iconTextStyle({ actionType })} style={{ fontFamily: 'DMSans_500Medium' }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default TableActionBadge;
