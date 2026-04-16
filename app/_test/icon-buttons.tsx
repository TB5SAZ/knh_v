import { AppIconButton } from '@/src/components/ui/AppIconButton';
import { Stack } from 'expo-router';
import { Bell, Home, Settings, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function AppIconButtonShowcase() {
  return (
    <>
      <Stack.Screen options={{ title: 'AppIconButton Showcase', headerBackTitle: 'Back' }} />
      <ScrollView contentContainerClassName="p-6" className="flex-1 bg-bg-main">

        {/* Solid Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-text-primary mb-4">Solid</Text>
          <View className="flex-row gap-4 items-center">
            <AppIconButton icon={Home} variant="solid" size="sm" />
            <AppIconButton icon={Settings} variant="solid" size="md" />
            <AppIconButton icon={Bell} variant="solid" size="lg" />
            <AppIconButton icon={User} variant="solid" size="xl" />
          </View>
        </View>

        {/* Soft Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-text-primary mb-4">Soft</Text>
          <View className="flex-row gap-4 items-center">
            <AppIconButton icon={Home} variant="soft" size="sm" />
            <AppIconButton icon={Settings} variant="soft" size="md" isActive={true} />
            <AppIconButton icon={Bell} variant="soft" size="lg" />
            <AppIconButton icon={User} variant="soft" size="xl" />
          </View>
        </View>

        {/* Outline Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-text-primary mb-4">Outline</Text>
          <View className="flex-row gap-4 items-center">
            <AppIconButton icon={Home} variant="outline" size="sm" isActive={true} />
            <AppIconButton icon={Settings} variant="outline" size="md" />
            <AppIconButton icon={Bell} variant="outline" size="lg" />
            <AppIconButton icon={User} variant="outline" size="xl" />
          </View>
        </View>

        {/* Ghost Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-text-primary mb-4">Ghost</Text>
          <View className="flex-row gap-4 items-center">
            <AppIconButton icon={Home} variant="ghost" size="sm" />
            <AppIconButton icon={Settings} variant="ghost" size="md" />
            <AppIconButton icon={Bell} variant="ghost" size="lg" isActive={true} />
            <AppIconButton icon={User} variant="ghost" size="xl" />
          </View>
        </View>

      </ScrollView>
    </>
  );
}
