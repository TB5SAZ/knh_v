import React from 'react';
import { Text, View, TextInput } from 'react-native';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { FormControl, FormControlLabel, FormControlError, FormControlErrorIcon, FormControlErrorText } from '@/components/ui/form-control';
import { AlertCircle } from 'lucide-react-native';

export interface AppTextareaProps extends React.ComponentProps<typeof TextareaInput> {
  label?: string;
  error?: string;
  isSuccess?: boolean;
  className?: string; // Container className
  numberOfLines?: number;
}

export const AppTextarea = React.forwardRef<TextInput, AppTextareaProps>(({
  label,
  error,
  isSuccess,
  className = '',
  numberOfLines = 4,
  ...props
}, ref) => {
  const isInvalid = !!error;

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
      
      <Textarea
        className={`bg-bg-surface px-3 py-3 min-h-[120px] rounded-lg ${borderClass} w-full`}
      >
        <TextareaInput
          ref={ref}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          className="flex-1 text-body-12-regular text-text-secondary p-0 web:outline-none placeholder:text-text-secondary"
          style={{ fontFamily: 'DMSans_400Regular' }}
          {...props}
        />
      </Textarea>
      
      {error && (
        <FormControlError className="mt-1 flex-row items-center gap-1">
          <FormControlErrorIcon as={AlertCircle} className="text-status-error-text h-[14px] w-[14px]" />
          <Text className="text-body-11-regular text-status-error-text">{error}</Text>
        </FormControlError>
      )}
    </FormControl>
  );
});

AppTextarea.displayName = 'AppTextarea';
