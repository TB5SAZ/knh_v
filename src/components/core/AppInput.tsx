import React, { useState } from 'react';
import { Text, View, TextInput } from 'react-native';
import { Input, InputField, InputSlot, InputIcon } from '@/src/components/ui/input';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText, FormControlErrorIcon } from '@/src/components/ui/form-control';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';

export interface AppInputProps extends Omit<React.ComponentProps<typeof InputField>, 'type' | 'value' | 'onChangeText' | 'size'> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  rightText?: string;
  isPassword?: boolean;
  isSuccess?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string; // Container className
  size?: 'sm' | 'md' | 'lg';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
}

export const AppInput = React.forwardRef<TextInput, AppInputProps>(({
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  rightText,
  isPassword,
  isSuccess,
  className = '',
  onChangeText,
  value,
  size = 'md',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isInvalid = !!error;

  const togglePassword = () => setShowPassword((prev) => !prev);
  
  const PasswordIcon = showPassword ? EyeOff : Eye;

  const heightClass = props.multiline
    ? 'min-h-[80px] py-2 items-start'
    : {
        sm: 'h-[30px] items-center',
        md: 'h-[36px] items-center',
        lg: 'h-[38px] items-center',
      }[size];

  const textClass = size === 'sm' ? 'text-body-11-regular' : 'text-body-12-regular';

  const borderClass = isInvalid 
    ? 'border-status-error-text data-[focus=true]:border-status-error-text' 
    : isSuccess 
      ? 'border-status-success-text data-[focus=true]:border-status-success-text' 
      : 'border-transparent data-[focus=true]:border-border-focus';

  return (
    <FormControl isInvalid={isInvalid} className={`w-full ${className}`}>
      {label && (
        <FormControlLabel className="mb-1.5">
          <Text className="text-body-11-medium text-text-secondary">{label}</Text>
        </FormControlLabel>
      )}
      
      <Input
        variant="outline"
        className={`bg-bg-surface px-3 rounded-lg flex-row gap-1.5 ${heightClass} ${borderClass}`}
      >
        {LeftIcon && (
          <InputSlot className="pl-0 pr-0">
            <InputIcon as={LeftIcon} className="text-text-secondary h-[18px] w-[18px]" />
          </InputSlot>
        )}
        
        <InputField
          ref={ref as any}
          secureTextEntry={isPassword && !showPassword}
          autoComplete={isPassword ? 'off' : props.autoComplete}
          autoCorrect={isPassword ? false : props.autoCorrect}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          spellCheck={isPassword ? false : props.spellCheck}
          className={`flex-1 ${textClass} text-text-secondary p-0 web:outline-none placeholder:text-text-secondary ${props.multiline ? 'min-h-[64px]' : ''}`}
          style={{ fontFamily: 'DMSans_400Regular', ...(props.multiline ? { textAlignVertical: 'top' } : {}) }}
          onChangeText={onChangeText}
          value={value}
          {...props}
        />
        
        {rightText && (
          <InputSlot className="pl-0 pr-0">
            <Text className={`${textClass} text-text-secondary`}>{rightText}</Text>
          </InputSlot>
        )}

        {RightIcon && !isPassword && (
          <InputSlot className="pl-0 pr-0">
            <InputIcon as={RightIcon} className="text-text-secondary h-[18px] w-[18px]" />
          </InputSlot>
        )}

        {isPassword && (
          <InputSlot 
            onPress={togglePassword} 
            className="pl-0 pr-0"
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            <InputIcon as={PasswordIcon} className="text-text-secondary h-[18px] w-[18px]" />
          </InputSlot>
        )}
      </Input>
      
      {error && (
        <FormControlError className="mt-1 flex-row items-center gap-1">
          <FormControlErrorIcon as={AlertCircle} className="text-status-error-text h-[14px] w-[14px]" />
          <Text className="text-body-11-regular text-status-error-text">{error}</Text>
        </FormControlError>
      )}
    </FormControl>
  );
});

AppInput.displayName = 'AppInput';
