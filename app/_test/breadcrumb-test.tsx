import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { AppBreadcrumb } from '@/components/ui/AppBreadcrumb';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BreadcrumbTestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6 gap-6">
        <Text className="text-xl font-bold text-slate-800">AppBreadcrumb Tester</Text>

        <View className="gap-2">
          <Text className="text-sm font-medium text-slate-500 mb-2">
            Test Case: 2 Items (as requested)
          </Text>
          <View className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <AppBreadcrumb
              items={[
                { label: 'Dashboard', href: '/' },
                { label: 'Leave Management' },
              ]}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-slate-500 mb-2">
            Test Case: 3 Items
          </Text>
          <View className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <AppBreadcrumb
              items={[
                { label: 'Dashboard', href: '/' },
                { label: 'HR Management', href: '/hr' },
                { label: 'Employee Profile' },
              ]}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-slate-500 mb-2">
            Test Case: Long Text Array (Flex Wrap Support)
          </Text>
          <View className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <AppBreadcrumb
              items={[
                { label: 'Dashboard', href: '/' },
                { label: 'Settings', href: '/settings' },
                { label: 'Company Architecture Overview', href: '/company' },
                { label: 'Very Long Department Name Structure Test' },
              ]}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
