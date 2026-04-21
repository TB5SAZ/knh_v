import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppInput } from '@/src/components/core/AppInput';
import { AppButton } from '@/src/components/core/AppButton';
import { AppAlertStatus } from '@/src/components/core/AppAlert';
import { formatName, formatLastName, formatKey } from '@/src/utils/formatters';
import { registerSchema, RegisterFormValues } from '@/src/schemas/auth.schema';
import { authService } from '@/src/services/authService';

interface AppAlertState {
  isOpen: boolean;
  status: AppAlertStatus;
  title: string;
  description: string;
}

interface RegisterFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setAlertState: React.Dispatch<React.SetStateAction<AppAlertState>>;
  onBackToLogin: () => void;
  justRegisteredRef: React.MutableRefObject<boolean>;
}

export const RegisterForm = React.memo(({ isLoading, setIsLoading, setAlertState, onBackToLogin, justRegisteredRef }: RegisterFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      tcKimlik: '',
      firstName: '',
      lastName: '',
      key: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onRegister = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      await authService.registerWithKey({
        tcKimlik: data.tcKimlik,
        firstName: data.firstName,
        lastName: data.lastName,
        key: data.key,
        password: data.password
      });
      
      reset();
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Kayıt Hatası',
        description: error.message || 'Bilinmeyen bir hata oluştu'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="w-full gap-5">
      <Controller
        control={control}
        name="tcKimlik"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <AppInput 
            size="md"
            label="T.C. Kimlik No" 
            placeholder="T.C. Kimlik Numaranızı giriniz" 
            value={value || ''}
            onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
            error={error?.message}
            keyboardType="numeric"
            autoComplete="off"
            maxLength={11}
          />
        )}
      />

      <View className="flex-col md:flex-row gap-5 w-full">
        <View className="flex-1 w-full">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <AppInput 
                size="md"
                label="Adı" 
                placeholder="Adınızı giriniz"
                value={value}
                onChangeText={(text) => onChange(formatName(text))}
                error={error?.message} 
              />
            )}
          />
        </View>
        <View className="flex-1 w-full">
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <AppInput 
                size="md"
                label="Soyadı" 
                placeholder="Soyadınızı giriniz" 
                value={value}
                onChangeText={(text) => onChange(formatLastName(text))}
                error={error?.message}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="key"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <AppInput 
            size="md"
            label="Key" 
            placeholder="Key bilginizi giriniz" 
            isPassword={true}
            value={value}
            onChangeText={(text) => onChange(formatKey(text))}
            error={error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <AppInput 
            size="md"
            label="Şifre" 
            placeholder="Şifrenizi belirleyiniz" 
            isPassword={true}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              if (getValues('passwordConfirm')) {
                trigger('passwordConfirm');
              }
            }}
            error={error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="passwordConfirm"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <AppInput 
            size="md"
            label="Şifre Tekrar" 
            placeholder="Şifrenizi tekrar giriniz" 
            isPassword={true}
            value={value}
            onChangeText={onChange}
            error={error?.message}
            onSubmitEditing={handleSubmit(onRegister)}
          />
        )}
      />

      <View className="w-full mt-2 gap-4">
        <AppButton 
          variant="primary" 
          size="lg" 
          title="KAYIT OL" 
          isLoading={isLoading}
          isDisabled={!isValid}
          onPress={handleSubmit(onRegister)}
        />
        <Pressable 
          className="p-2 items-center" 
          onPress={onBackToLogin}
        >
          <Text className="text-brand-dark text-body-12-bold underline">
            Geri Dön
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
