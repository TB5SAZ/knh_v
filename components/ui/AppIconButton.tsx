import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { Button, ButtonIcon } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react-native';

export type AppIconButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type AppIconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AppIconButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant' | 'size'> {
  icon: LucideIcon;
  variant?: AppIconButtonVariant;
  size?: AppIconButtonSize;
  isActive?: boolean;
}

const sizeClasses = {
  sm: 'p-[4px] rounded-[6px] h-auto w-auto',
  md: 'p-[6px] rounded-lg h-auto w-auto',
  lg: 'p-[8px] rounded-lg h-auto w-auto',
  xl: 'p-[10px] rounded-[10px] h-auto w-auto',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

const variantContainerClasses = {
  solid: 'bg-brand-primary border-transparent',
  soft: 'bg-brand-light border-transparent',
  outline: 'bg-transparent border border-border-default',
  ghost: 'bg-transparent border-transparent',
};

const variantIconClasses = {
  solid: 'text-white',
  soft: 'text-text-primary',
  outline: 'text-text-primary',
  ghost: 'text-text-primary',
};

const disabledContainerClass = 'bg-status-disabled-bg border-transparent pointer-events-none focus:outline-none';
const disabledIconClass = 'text-status-disabled-text';

export const AppIconButton = forwardRef<React.ElementRef<typeof Button>, AppIconButtonProps>(
  ({
    icon: Icon,
    variant = 'solid',
    size = 'md',
    isActive = false,
    isDisabled = false,
    className = '',
    onPress,
    ...rest
  }, ref) => {
    
    let resolvedContainerClass = isDisabled 
      ? disabledContainerClass 
      : variantContainerClasses[variant];
      
    let resolvedIconClass = isDisabled 
      ? disabledIconClass 
      : variantIconClasses[variant];
      
    // Tutarlı isActive (seçili olma durumu) stillendirmesi
    if (isActive && !isDisabled) {
        if (variant === 'solid') {
           resolvedContainerClass = 'bg-brand-dark border-transparent';
        } else if (variant === 'soft') {
           resolvedContainerClass = 'bg-brand-primary border-transparent';
           resolvedIconClass = 'text-white';
        } else if (variant === 'outline') {
           resolvedContainerClass = 'bg-transparent border border-brand-primary';
           resolvedIconClass = 'text-brand-primary';
        } else if (variant === 'ghost') {
           resolvedContainerClass = 'bg-brand-light border-transparent';
           resolvedIconClass = 'text-brand-primary';
        }
    }

    return (
      <Button
        ref={ref}
        onPress={onPress}
        action="unstyled"
        variant="solid"
        size="md"
        isDisabled={isDisabled}
        className={`group overflow-hidden items-center justify-center data-[active=true]:scale-[0.95] transition-transform duration-100 ${sizeClasses[size]} ${resolvedContainerClass} ${className}`}
        {...rest}
      >
        {/* Otomatik Koyulaştırma Katmanı (Hover/Press state) */}
        {!isDisabled && (
          <View className="absolute inset-0 bg-black opacity-0 group-[&:hover]:opacity-[0.25] group-[&:active]:opacity-[0.25] group-data-[hover=true]:opacity-[0.25] group-data-[active=true]:opacity-[0.25] pointer-events-none" />
        )}

        <ButtonIcon as={Icon} size={iconSizes[size] as any} className={`z-10 ${resolvedIconClass}`} />
      </Button>
    );
  }
);

AppIconButton.displayName = 'AppIconButton';
