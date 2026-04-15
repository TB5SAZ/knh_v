import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { LayoutDashboard } from 'lucide-react-native';
import { AppNavButton } from '@/components/ui/AppNavButton';

export default function AppNavButtonShowcase() {
  return (
    <>
      <Stack.Screen options={{ title: 'AppNavButton Showcase', headerBackTitle: 'Back' }} />
      <ScrollView contentContainerClassName="p-6" className="flex-1 bg-white">
        
        <Text className="text-2xl font-bold text-slate-800 mb-6">Sidebar Navigations</Text>
        
        <View className="w-64 max-w-full space-y-6">
          {/* 1. Aktif, Badge'li, Chevron'lu */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-slate-500 mb-2">1. Aktif, Badge & Chevron</Text>
            <AppNavButton 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={true} 
              badgeCount={12} 
              hasChevron={true} 
            />
          </View>

          {/* 2. Pasif, Badge'li, Chevron'lu */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-slate-500 mb-2">2. Pasif, Badge & Chevron</Text>
            <AppNavButton 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={false} 
              badgeCount={12} 
              hasChevron={true} 
            />
          </View>

          {/* 3. Pasif, Sadece Badge */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-slate-500 mb-2">3. Pasif, Sadece Badge</Text>
            <AppNavButton 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={false} 
              badgeCount={12} 
            />
          </View>

          {/* 4. Soft Arka Planlı (Pasif duruma hover simülasyonu ya da className override) */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-slate-500 mb-2">4. Soft Arka Planlı (bg-gray-50)</Text>
            <AppNavButton 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={false} 
              badgeCount={12} 
              className="bg-gray-50"
            />
          </View>

          {/* 5. Collapsed Aktif */}
          <View className="mb-4 gap-2">
            <Text className="text-sm font-bold text-slate-500 mb-2">5. Collapsed (Aktif)</Text>
            <AppNavButton 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={true} 
              isCollapsed={true} 
            />
          </View>

          {/* 6. Collapsed Pasif Badge'li */}
          <View className="mb-4 gap-2">
            <Text className="text-sm font-bold text-slate-500 mb-2">6. Collapsed (Pasif, Dot Badge)</Text>
            <AppNavButton 
              label="Dashboard" 
              icon={LayoutDashboard} 
              isActive={false} 
              isCollapsed={true} 
              badgeCount={3} 
            />
          </View>

        </View>

      </ScrollView>
    </>
  );
}
