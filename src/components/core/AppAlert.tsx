import React from 'react';
import { View, Text } from 'react-native';
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
}

export const AppAlert: React.FC<AppAlertProps> = ({
  isOpen,
  onClose,
  title,
  description,
  status = 'info',
  confirmText = 'Tamam',
  onConfirm,
}) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
      <AlertDialogBackdrop className="bg-black/50" />
      <AlertDialogContent className="bg-bg-main p-6 rounded-[20px] w-[90%] max-w-[400px] border-0">
        
        <AlertDialogHeader className="mb-2">
          <View className="flex-row items-center">
            <Text className="text-heading-16-semibold text-text-primary">{title}</Text>
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
            />
          )}
          <AppButton 
            variant={status === 'success' ? 'success' : status === 'error' ? 'error' : 'primary'} 
            title={confirmText} 
            onPress={() => {
              if (onConfirm) onConfirm();
              onClose();
            }} 
            size="md" 
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
