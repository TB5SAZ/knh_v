import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/src/providers/AuthProvider';
import { AppAlert } from '../core/AppAlert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@/src/components/ui/modal';
import { AlertTriangle, X } from 'lucide-react-native';
import { AppInput } from '../core/AppInput';
import { AppSelect } from '../core/AppSelect';
import { AppButton } from '../core/AppButton';
import { addBlacklistSchema, AddBlacklistFormValues } from '@/src/schemas/blacklist.schema';
import { useAddBlacklistModal } from '@/src/hooks/blacklist/useAddBlacklistModal';

export interface AddBlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    tcNo?: string;
    firstName?: string;
    lastName?: string;
  };
}

export function AddBlacklistModal({ isOpen, onClose, onSuccess, initialData }: AddBlacklistModalProps) {
  const { user, profile } = useAuth();
  
  const methods = useForm<AddBlacklistFormValues>({
    resolver: zodResolver(addBlacklistSchema),
    mode: 'onChange',
    defaultValues: {
      tcNo: initialData?.tcNo || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      department: '',
      personnel: '',
      reason: '',
    },
  });

  const { control, handleSubmit, reset, formState: { errors } } = methods;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        tcNo: initialData?.tcNo || '',
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        department: '',
        personnel: '',
        reason: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const {
    departments,
    personnelOptions,
    isLoading,
    alertState,
    setAlertState,
    onSubmit,
    handleClose,
    isOther
  } = useAddBlacklistModal(isOpen, onClose, methods, user, profile, onSuccess);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalBackdrop className="bg-black/50" />
      <ModalContent className="bg-white w-[90%] max-w-[400px] border-0">
        <ModalHeader className="pb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AlertTriangle color="#ef4444" size={20} />
            <Text className="text-body-16-semibold text-text-primary" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              Kara Listeye Ekle
            </Text>
          </View>
          <ModalCloseButton onPress={handleClose}>
            <X size={20} color="#6e6f78" />
          </ModalCloseButton>
        </ModalHeader>
        
        <ModalBody className="py-4">
          <View className="flex-col gap-4">
            <Controller
              control={control}
              name="tcNo"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="TC Kimlik No"
                  placeholder="11 haneli TC kimlik no giriniz"
                  keyboardType="numeric"
                  maxLength={11}
                  value={value}
                  onChangeText={onChange}
                  error={errors.tcNo?.message}
                />
              )}
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Ad"
                      placeholder="Kişinin adını giriniz"
                      value={value}
                      onChangeText={(text) => {
                        const formatted = text.split(' ').map(word => 
                          word ? word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR') : ''
                        ).join(' ');
                        onChange(formatted);
                      }}
                      error={errors.firstName?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Soyad"
                      placeholder="Kişinin soyadını giriniz"
                      value={value}
                      onChangeText={(text) => {
                        const formatted = text.toLocaleUpperCase('tr-TR');
                        onChange(formatted);
                      }}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="department"
              render={({ field: { onChange, value } }) => (
                <View style={{ zIndex: 10 }}>
                  <Text className="text-body-11-medium text-text-secondary mb-1.5" style={{ fontFamily: 'DMSans_500Medium' }}>
                    Kısım / Departman
                  </Text>
                  <AppSelect
                    options={departments}
                    placeholder={departments.length > 0 ? "Seçiniz" : "Yükleniyor..."}
                    selectedValue={value}
                    onValueChange={(val) => {
                      onChange(val);
                      methods.setValue('personnel', '');
                    }}
                    isDisabled={isOther}
                    className={errors.department ? 'border-status-error-text' : ''}
                  />
                  {errors.department && (
                    <Text className="text-body-11-regular text-status-error-text mt-1" style={{ fontFamily: 'DMSans_400Regular' }}>
                      {errors.department.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="personnel"
              render={({ field: { onChange, value } }) => (
                <View style={{ zIndex: 5 }}>
                  <Text className="text-body-11-medium text-text-secondary mb-1.5" style={{ fontFamily: 'DMSans_500Medium' }}>
                    Kişi
                  </Text>
                  <AppSelect
                    options={personnelOptions}
                    placeholder={methods.watch('department') ? "Kişi seçiniz" : "Önce departman seçiniz"}
                    selectedValue={value}
                    onValueChange={onChange}
                    isDisabled={!methods.watch('department') || isOther}
                    className={errors.personnel ? 'border-status-error-text' : ''}
                  />
                  {errors.personnel && (
                    <Text className="text-body-11-regular text-status-error-text mt-1" style={{ fontFamily: 'DMSans_400Regular' }}>
                      {errors.personnel.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="reason"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="text-body-11-medium text-text-secondary mb-1.5" style={{ fontFamily: 'DMSans_500Medium' }}>
                    Engellenme Nedeni
                  </Text>
                  <AppInput
                    multiline
                    numberOfLines={4}
                    placeholder="Lütfen detaylı açıklama giriniz..."
                    value={value}
                    onChangeText={(text) => {
                      const formatted = text ? text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1) : '';
                      onChange(formatted);
                    }}
                    error={errors.reason?.message}
                  />
                </View>
              )}
            />
          </View>
        </ModalBody>
        
        <ModalFooter className="pt-4 flex-row justify-end gap-3">
          <AppButton 
            title="İptal" 
            variant="ghost" 
            onPress={handleClose} 
            className="px-6 bg-[#f5f5f5]"
            isDisabled={isLoading}
          />
          <AppButton 
            title="Kara Listeye Ekle" 
            variant="error" 
            onPress={handleSubmit(onSubmit)} 
            className="px-6"
            isLoading={isLoading}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>

    <AppAlert
      isOpen={alertState.isOpen}
      onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      title={alertState.title}
      description={alertState.description}
      status={alertState.status}
    />
    </>
  );
}
