import React from 'react';
import { View } from 'react-native';
import { VStack } from '@/src/components/ui/vstack';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { LucideIcon } from 'lucide-react-native';

export type SummaryCardVariant = 'default' | 'primary';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trendValue: string;
  trendLabel: string;
  variant?: SummaryCardVariant;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  trendValue,
  trendLabel,
  variant = 'default',
}: SummaryCardProps) {
  const isPrimary = variant === 'primary';
  const isNegative = trendValue.startsWith('-');

  // Define badge styles
  const badgeBgClass = isNegative 
    ? 'bg-red-100' 
    : (isPrimary ? 'bg-brand-dark' : 'bg-brand-light');
    
  const badgeTextClass = isNegative 
    ? 'text-red-600' 
    : (isPrimary ? 'text-white' : 'text-brand-dark');

  return (
    <View
      className={`p-4 rounded-[16px] justify-between flex-1 xl:h-[109px] ${
        isPrimary 
          ? 'bg-brand-light' 
          : 'bg-bg-main'
      }`}
    >
      {/* Desktop Layout (>= 1280px) */}
      <View className="hidden xl:flex flex-col justify-between flex-1">
        <HStack className="items-center gap-2">
          <Icon 
            size={18} 
            color={isPrimary ? "#35BFA3" : "#63716E"}
            strokeWidth={1.5}
          />
          <Text
            className="text-body-12-regular text-text-secondary"
            style={{ fontSize: 12, fontFamily: 'DMSans_400Regular' }}
          >
            {title}
          </Text>
        </HStack>

        <HStack className="items-end justify-between w-full mt-3">
          <Text
            className={`text-heading-28-bold text-[28px] tracking-[-1.12px] leading-[1.2] ${
              isPrimary ? 'text-brand-dark' : 'text-text-primary'
            }`}
            style={{ fontSize: 28, fontFamily: 'DMSans_700Bold' }}
          >
            {value}
          </Text>

          <VStack className="items-end gap-1">
            <View
              className={`px-[6px] py-[2px] rounded-[10px] items-center justify-center ${badgeBgClass}`}
            >
              <Text
                className={`text-body-11-medium leading-none ${badgeTextClass}`}
                style={{ fontSize: 11, fontFamily: 'DMSans_500Medium', paddingBottom: 1 }}
              >
                {trendValue}
              </Text>
            </View>
            <Text 
              className="text-body-10-regular text-text-secondary leading-none"
              style={{ fontSize: 10, fontFamily: 'DMSans_400Regular' }}
            >
              {trendLabel}
            </Text>
          </VStack>
        </HStack>
      </View>

      {/* Mobile & Tablet Layout (< 1280px) */}
      <View className="flex xl:hidden flex-col justify-between flex-1 gap-8">
        <Text
          className="text-body-12-regular text-text-secondary"
          style={{ fontSize: 12, fontFamily: 'DMSans_400Regular' }}
        >
          {title}
        </Text>

        <VStack className="gap-3">
          {/* Icon & Value Row */}
          <HStack className="items-center gap-3">
            <Icon 
              size={32} 
              color={isPrimary ? "#0E4D41" : "#63716E"}
              strokeWidth={1.5}
            />
            <Text
              className={`text-heading-28-bold text-[28px] tracking-[-1.12px] leading-[1.2] ${
                isPrimary ? 'text-brand-dark' : 'text-text-primary'
              }`}
              style={{ fontSize: 28, fontFamily: 'DMSans_700Bold' }}
            >
              {value}
            </Text>
          </HStack>

          {/* Trend Row */}
          <HStack className="items-center gap-1.5 pt-0.5">
            <View
              className={`px-[6px] py-[2px] rounded-[10px] items-center justify-center ${badgeBgClass}`}
            >
              <Text
                className={`text-body-11-medium leading-none ${badgeTextClass}`}
                style={{ fontSize: 11, fontFamily: 'DMSans_500Medium', paddingBottom: 1 }}
              >
                {trendValue}
              </Text>
            </View>
            <Text 
              className="text-body-10-regular text-text-secondary leading-none"
              style={{ fontSize: 10, fontFamily: 'DMSans_400Regular' }}
            >
              {trendLabel}
            </Text>
          </HStack>
        </VStack>
      </View>
    </View>
  );
}
