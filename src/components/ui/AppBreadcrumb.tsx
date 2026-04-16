import React from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/src/components/ui/text';

export interface AppBreadcrumbItem {
  label: string;
  href?: string;
}

export interface AppBreadcrumbProps {
  items: AppBreadcrumbItem[];
}

export function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  return (
    <View className="flex-row items-center flex-wrap gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View key={`breadcrumb-${index}`} className="flex-row items-center">
            {isLast ? (
              <Text className="text-slate-700 text-sm font-medium">
                {item.label}
              </Text>
            ) : (
              <Link href={item.href || '#'}>
                <Text className="text-teal-500 text-sm font-medium">
                  {item.label}
                </Text>
              </Link>
            )}

            {!isLast && (
              <Text className="text-gray-400 text-sm mx-1">/</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
