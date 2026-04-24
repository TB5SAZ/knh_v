import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@/src/components/ui/alert-dialog';
import { AppButton } from './AppButton';

export type AppAlertStatus = 'success' | 'error' | 'warning' | 'info';

export interface AppAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  status?: AppAlertStatus;
  confirmText?: string;
  onConfirm?: () => void;
  disableCloseForSeconds?: number;
  className?: string;
  titleClassName?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export const AppAlert: React.FC<AppAlertProps> = ({
  isOpen,
  onClose,
  title,
  description,
  status = 'info',
  confirmText = 'Tamam',
  onConfirm,
  disableCloseForSeconds,
  className,
  titleClassName,
  icon: Icon,
  iconColor,
}) => {
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (isOpen && disableCloseForSeconds && disableCloseForSeconds > 0) {
      setCountdown(disableCloseForSeconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown(0);
    }
  }, [isOpen, disableCloseForSeconds]);

  const isClosingDisabled = countdown > 0;
  const displayConfirmText = isClosingDisabled ? `${confirmText} (${countdown})` : confirmText;

  // Determine default icon color based on status if not explicitly provided
  const getIconColor = () => {
    if (iconColor) return iconColor;
    switch (status) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return '#1e1e1e';
    }
  };

  return (
    <AlertDialog isOpen={isOpen} onClose={isClosingDisabled ? () => {} : onClose} size="md">
      <AlertDialogBackdrop className="bg-black/50" />
      <AlertDialogContent className={`bg-bg-main p-6 rounded-[20px] w-[90%] max-w-[400px] border-0 ${className || ''}`}>
        
        <AlertDialogHeader className="mb-2">
          <View className="flex-row items-center gap-2">
            {Icon && <Icon color={getIconColor()} size={24} />}
            <Text className={`text-heading-16-semibold ${titleClassName || 'text-text-primary'}`}>{title}</Text>
          </View>
        </AlertDialogHeader>
        
        <AlertDialogBody className="mb-6">
          <Text className="text-body-14-regular text-text-secondary">{description}</Text>
        </AlertDialogBody>
        
        <AlertDialogFooter className="flex-row justify-end gap-3 p-0 m-0">
          {onConfirm && (
            <AppButton 
              variant="ghost" 
              title="İptal" 
              onPress={onClose} 
              size="md" 
              isDisabled={isClosingDisabled}
            />
          )}
          <AppButton 
            variant={status === 'success' ? 'success' : status === 'error' ? 'error' : 'primary'} 
            title={displayConfirmText} 
            onPress={() => {
              if (isClosingDisabled) return;
              if (onConfirm) onConfirm();
              onClose();
            }} 
            size="md" 
            isDisabled={isClosingDisabled}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
