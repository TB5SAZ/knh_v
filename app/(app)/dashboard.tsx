import React from 'react';
import { View, Text } from 'react-native';
import { AppButton } from '@/src/components/core/AppButton';
import { authService } from '@/src/services/authService';

export default function IndexScreen() {
  const handleLogout = async () => {
    try {
       await authService.logout();
    } catch(err) {
       console.error("Logout failed", err);
    }
  };

  return (
    <View className="flex-1 bg-transparent items-center justify-center p-6">
      <Text className="text-3xl text-text-primary font-bold mb-8 text-center text-heading-16-semibold">
        Hastaneye Hoş Geldiniz!
      </Text>
      
      <AppButton 
        variant="error" 
        size="lg" 
        title="Çıkış Yap" 
        onPress={handleLogout} 
      />
    </View>
  );
}
