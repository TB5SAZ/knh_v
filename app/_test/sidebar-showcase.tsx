import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { Switch } from '@/src/components/ui/switch';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';

export default function SidebarShowcase() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 flex-row">
      <Sidebar isCollapsed={isCollapsed} />
      
      <View className="flex-1 p-8 items-start">
        <View className="bg-white p-6 rounded-2xl shadow-sm">
          <Text className="text-xl font-bold mb-4 text-slate-800">Sidebar Controls</Text>
          <HStack className="items-center gap-4">
            <Text className="text-base text-slate-600 font-medium">Toggle Collapsed Mode</Text>
            <Switch 
              value={isCollapsed} 
              onValueChange={setIsCollapsed} 
            />
          </HStack>
          
          <View className="mt-8">
            <Text className="text-sm text-slate-400">Current Mode:</Text>
            <Text className="text-lg font-bold text-teal-600 uppercase tracking-widest mt-1">
              {isCollapsed ? 'Collapsed (60px)' : 'Expanded (245px)'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
