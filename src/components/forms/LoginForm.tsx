import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { secureStorage } from '@/src/lib/storage';

const SUPPORT_PHONE_NUMBER = '0 (551) 537 14 12';

import { AppInput } from '@/src/components/core/AppInput';
import { AppCheckbox } from '@/src/components/core/AppCheckbox';
import { AppButton } from '@/src/components/core/AppButton';
import { AppAlertStatus } from '@/src/components/core/AppAlert';
import { authService } from '@/src/services/authService';
import { loginSchema, LoginFormValues } from '@/src/schemas/auth.schema';

interface AppAlertState {
  isOpen: boolean;
  status: AppAlertStatus;
  title: string;
  description: string;
}

interface LoginFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setAlertState: React.Dispatch<React.SetStateAction<AppAlertState>>;
  justRegisteredRef: React.MutableRefObject<boolean>;
}

export function LoginForm({ isLoading, setIsLoading, setAlertState, justRegisteredRef }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      tcKimlik: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    const loadRememberedUser = async () => {
      try {
        const savedTc = await secureStorage.getItem('knh_vams_remembered_tc');
        if (savedTc) {
          setValue('tcKimlik', savedTc, { shouldValidate: true });
          setValue('rememberMe', true);
        }
      } catch (e) {
        console.error('Beni hatırla okunamadı');
      }
    };
    loadRememberedUser();
  }, [setValue]);

  const onLogin = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      // Kullanıcı manuel login yaptığı için artık otomatik supabase session yakalamayı engelleyen bloku kaldırıyoruz
      if (justRegisteredRef) {
        justRegisteredRef.current = false;
      }

      if (data.rememberMe) {
        await secureStorage.setItem('knh_vams_remembered_tc', data.tcKimlik);
      } else {
        await secureStorage.removeItem('knh_vams_remembered_tc');
      }

      await authService.loginWithTc(data.tcKimlik, data.password);
      // Başarılı girişte alert göstermiyoruz, arka planda useLoginScreen zaten anında yönlendirecek.
    } catch (error: any) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Giriş Başarısız',
        description: 'TC Kimlik veya Şifre hatalı. Lütfen tekrar deneyiniz.'
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
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <AppInput 
            size="md"
            label="Şifre" 
            placeholder="Şifrenizi giriniz" 
            isPassword={true}
            value={value}
            onChangeText={onChange}
            error={error?.message}
            onSubmitEditing={handleSubmit(onLogin)}
          />
        )}
      />
      
      <View className="flex-row items-center justify-between mt-[-4px]">
        <View className="flex-1">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field: { onChange, value } }) => (
              <AppCheckbox 
                size="md" 
                value="remember" 
                label="Beni Hatırla" 
                isChecked={value}
                onChange={onChange}
              />
            )}
          />
        </View>
        <Text 
          className="text-brand-dark text-body-12-bold underline text-right"
          onPress={() => setAlertState({
            isOpen: true,
            status: 'info',
            title: 'Şifre Sıfırlama',
            description: `Lütfen sistem yöneticisi ile iletişime geçin:\n${SUPPORT_PHONE_NUMBER}`
          })}
        >
          Şifremi Unuttum
        </Text>
      </View>

      <View className="w-full mt-2">
        <AppButton 
          variant="primary" 
          size="lg" 
          title="GİRİŞ YAP" 
          isLoading={isLoading}
          isDisabled={!isValid}
          onPress={handleSubmit(onLogin)}
        />
      </View>
    </View>
  );
}
