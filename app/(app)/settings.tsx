import React from 'react';
import { View, Text } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { AppButton } from '@/src/components/core/AppButton';
import { useAuth } from '@/src/providers/AuthProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { role } = useAuth();

  if (role !== 'Sistem Yöneticisi') {
    return <Redirect href="/dashboard" />;
  }

  return (
    <View className="flex-1 p-6 bg-bg-main items-center justify-center">
      <View className="bg-bg-surface p-8 rounded-2xl border border-border-light shadow-sm w-full max-w-md items-center">
        <Text className="text-heading-18-semibold text-text-primary mb-2">Kontrol Paneli</Text>
        <Text className="text-body-14-regular text-text-secondary mb-8 text-center">
          Sistem ayarları ve yönetimsel işlemler burada listelenecektir. (Yapım Aşamasında)
        </Text>
        
        <AppButton 
          title="Davet Anahtarı (Key) Üret" 
          onPress={() => router.push('/keygen')} 
          leftIcon={KeyRound}
          variant="primary"
          size="lg"
          className="w-full"
        />
      </View>
    </View>
  );
}
