import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { AppButton } from '@/src/components/core/AppButton';

export default function VisitorsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-transparent gap-6">
      <Text className="text-xl font-medium text-slate-700">Ziyaretçiler Sayfası (Yapım Aşamasında)</Text>
      
      <AppButton 
        title="Yeni Ziyaretçi Ekle" 
        leftIcon={Plus}
        onPress={() => router.push('/visitors/add')}
      />
    </View>
  );
}
