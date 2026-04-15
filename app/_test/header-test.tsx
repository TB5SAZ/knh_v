import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Header } from '@/components/layout/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

export default function HeaderTestScreen() {
  const dummyBreadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Leave Management' }
  ];

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 40 }}>
          
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <Text className="text-blue-800 font-bold mb-1">Responsive Test Bilgisi</Text>
            <Text className="text-blue-600 text-sm">
              Masaüstü (Desktop) görünümü ile Tablet (Orta Ekran) görünümü arasındaki boyut farklarını 
              görmek için lütfen tarayıcı pencerenizin genişliğini daraltıp genişletiniz. (lg ve md breakpointleri pencere genişliğine göre çalışmaktadır.)
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-4 text-slate-800">Ana Sayfa Görünümü (İçerik Genişliğinde)</Text>
            <View className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <Header 
                title="Management" 
                isMainPage={true} 
              />
            </View>
          </View>

          <View>
            <Text className="text-lg font-bold mb-4 text-slate-800">Alt Sayfa Görünümü (Tam Genişlik)</Text>
            <View className="border border-gray-200 rounded-lg overflow-hidden flex-1 w-full bg-white shadow-sm">
              <Header 
                title="Leave Application" 
                isMainPage={false} 
                breadcrumbItems={dummyBreadcrumbs}
              />
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </GluestackUIProvider>
  );
}
