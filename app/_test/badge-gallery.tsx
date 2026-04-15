import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CustomBadge } from '@/components/ui/CustomBadge';
import { CustomAvatar } from '@/components/ui/CustomAvatar';

// Helper component for the showcase
const BoxWithBadge = ({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) => (
  <View className="items-center mb-8 mx-4">
    <Text className="text-sm text-gray-600 mb-4 font-medium">{title}</Text>
    <View className="relative w-12 h-12 bg-gray-200 rounded-md shadow-sm">
      {/* Icon Placeholder (optional) */}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-gray-400 text-xs">Icon</Text>
      </View>
      {/* Absolute Badge */}
      {children}
    </View>
  </View>
);

export default function BadgeGalleryScreen() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-6">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Badge Showcase</Text>
        <Text className="text-gray-500">
          Tüm CustomBadge varyasyonlarını bu sayfada görebilirsiniz.
        </Text>
      </View>

      {/* Solid Variant (Normal Rakamlar) */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Solid Variant (count: 5)</Text>
        <View className="flex-row flex-wrap items-end">
          <BoxWithBadge title="Small (sm)">
            <CustomBadge 
              count={5} 
              size="sm" 
              className="absolute -top-2 -right-2 z-10" 
            />
          </BoxWithBadge>

          <BoxWithBadge title="Medium (md)">
            <CustomBadge 
              count={5} 
              size="md" 
              className="absolute -top-2 -right-2 z-10" 
            />
          </BoxWithBadge>

          <BoxWithBadge title="Large (lg)">
            <CustomBadge 
              count={5} 
              size="lg" 
              className="absolute -top-2 -right-2 z-10" 
            />
          </BoxWithBadge>
        </View>
      </View>

      {/* Dot Variant (Noktasal) */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Dot Variant (No Text)</Text>
        <View className="flex-row flex-wrap items-end">
          <BoxWithBadge title="Small (sm)">
            <CustomBadge 
              variant="dot" 
              size="sm" 
              className="absolute -top-1 -right-1 z-10" 
            />
          </BoxWithBadge>

          <BoxWithBadge title="Medium (md)">
            <CustomBadge 
              variant="dot" 
              size="md" 
              className="absolute -top-1.5 -right-1.5 z-10" 
            />
          </BoxWithBadge>

          <BoxWithBadge title="Large (lg)">
            <CustomBadge 
              variant="dot" 
              size="lg" 
              className="absolute -top-2 -right-2 z-10" 
            />
          </BoxWithBadge>
        </View>
      </View>

      {/* Overflow Scenario (99+) */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Overflow (count > 99)</Text>
        <View className="flex-row flex-wrap items-end">
          <BoxWithBadge title="Medium (md)">
            <CustomBadge 
              count={150} 
              size="md" 
              className="absolute -top-2 -right-3 z-10" 
            />
          </BoxWithBadge>
          
          <BoxWithBadge title="Large (lg)">
            <CustomBadge 
              count={1002} 
              size="lg" 
              className="absolute -top-2 -right-4 z-10" 
            />
          </BoxWithBadge>
        </View>
      </View>

      {/* Custom Avatar Showcase */}
      <View className="mb-6 mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Custom Avatar Showcase</Text>
        <View className="flex-row items-center gap-6">
          <View className="items-center">
            <CustomAvatar name="JD" size="sm" />
            <Text className="text-xs text-gray-500 mt-2">sm</Text>
          </View>
          <View className="items-center">
            <CustomAvatar name="DL" size="md" />
            <Text className="text-xs text-gray-500 mt-2">md (Kısaltma)</Text>
          </View>
          <View className="items-center">
            <CustomAvatar 
              name="Sarah" 
              size="lg" 
              imageUrl="https://i.pravatar.cc/150?img=47" 
            />
            <Text className="text-xs text-gray-500 mt-2">lg + Image</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}
