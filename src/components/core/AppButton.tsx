import React, { forwardRef } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { Button, ButtonIcon } from '@/src/components/ui/button';
import { LucideIcon } from 'lucide-react-native';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'error';
export type AppButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AppButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant' | 'size'> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  title: string;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

const sizeClasses = {
  sm: 'px-[10px] py-[6px] rounded-lg gap-1 h-[28px]',
  md: 'px-[12px] py-[8px] rounded-lg gap-1.5 h-[34px]',
  lg: 'px-[16px] py-[10px] rounded-[10px] gap-2 h-[40px]',
  xl: 'px-[18px] py-[12px] rounded-xl gap-2 h-[44px]',
};

const textClasses = {
  sm: 'text-btn-11-medium',
  md: 'text-btn-12-medium',
  lg: 'text-btn-14-medium',
  xl: 'text-btn-16-semibold',
};

const iconSizes = {
  sm: 14,
  md: 14,
  lg: 16,
  xl: 18,
};

const variantClasses = {
  primary: 'bg-brand-primary border-transparent data-[active=true]:opacity-80',
  secondary: 'bg-brand-light border-transparent data-[active=true]:opacity-80',
  ghost: 'bg-transparent border-transparent data-[active=true]:opacity-80',
  success: 'bg-status-success-text border-transparent data-[active=true]:opacity-80',
  error: 'bg-status-error-text border-transparent data-[active=true]:opacity-80',
};

const variantTextClasses = {
  primary: 'text-white',
  secondary: 'text-text-primary',
  ghost: 'text-text-primary',
  success: 'text-status-success-bg',
  error: 'text-status-error-bg',
};

const disabledContainerClass = 'bg-status-disabled-bg border-transparent focus:outline-none';
const disabledTextClass = 'text-status-disabled-text';

const spinnerColors = {
  primary: '#FFFFFF',
  secondary: '#203430',
  ghost: '#203430',
  success: '#FFFFFF',
  error: '#FFFFFF',
};
const disabledSpinnerColor = '#203430';

export const AppButton = forwardRef<React.ElementRef<typeof Button>, AppButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    title,
    isLoading = false,
    isDisabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    onPress,
    ...rest
  }, ref) => {
    
    // Yüklenme anında butonu gri yapmak yerine orjinal renginde tutuyoruz
    const resolvedContainerClass = isDisabled 
      ? disabledContainerClass 
      : `${variantClasses[variant]} ${isLoading ? 'opacity-90' : ''}`;
      
    const resolvedTextClass = isDisabled 
      ? disabledTextClass 
      : variantTextClasses[variant];
      
    const resolvedSpinnerColor = isDisabled 
      ? disabledSpinnerColor 
      : spinnerColors[variant];

    return (
      <Button
        ref={ref}
        onPress={onPress}
        action="unstyled"
        variant="solid"
        size="md"
        isDisabled={isDisabled || isLoading}
        internalClassName={`group overflow-hidden flex-row items-center justify-center border-0 ${sizeClasses[size]} ${resolvedContainerClass} ${className}`}
        {...rest}
      >
        {/* Otomatik Koyulaştırma Katmanı */}
        <View 
          pointerEvents="none"
          className="absolute inset-0 bg-black opacity-0 group-[&:hover]:opacity-[0.25] group-[&:active]:opacity-[0.25] group-data-[hover=true]:opacity-[0.25] group-data-[active=true]:opacity-[0.25]" 
        />

        {isLoading ? <ActivityIndicator color={resolvedSpinnerColor} size="small" /> : null}
        {!isLoading && LeftIcon ? <ButtonIcon as={LeftIcon} size={iconSizes[size] as any} internalClassName={`z-10 ${resolvedTextClass}`} /> : null}
        <Text className={`text-center z-10 ${textClasses[size]} ${resolvedTextClass}`}>{title}</Text>
        {!isLoading && RightIcon ? <ButtonIcon as={RightIcon} size={iconSizes[size] as any} internalClassName={`z-10 ${resolvedTextClass}`} /> : null}
      </Button>
    );
  }
);

AppButton.displayName = 'AppButton';
