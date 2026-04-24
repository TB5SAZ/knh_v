import React from 'react';
import { View } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { VStack } from '@/src/components/ui/vstack';
import { Text } from '@/src/components/ui/text';
import { PieChart } from 'react-native-gifted-charts';
import { UserX, ShieldOff, Building2, Globe } from 'lucide-react-native';
import { COLORS } from '@/src/constants/theme';

// We will generate pieData dynamically inside the component

interface LegendItemProps {
  color: string;
  title: string;
  value: string;
  percentage: string;
  icon: React.ElementType;
  iconColor: string;
}

const LegendItem = ({ color, title, value, percentage, icon: Icon, iconColor }: LegendItemProps) => {
  return (
    <View className="flex-col items-center gap-1 w-full">
      <View className="flex-row items-center justify-center gap-1.5">
        <View className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <Text 
          className="text-[11px] md:text-[12px] text-center" 
          style={{ fontFamily: 'DMSans_400Regular', color: COLORS.chart.textPrimary }}
        >
          {title}
        </Text>
      </View>
      <View className="flex-row items-center justify-center gap-1.5">
        <Icon size={14} color={iconColor} />
        <Text 
          className="text-[11px] md:text-[12px]" 
          style={{ fontFamily: 'DMSans_400Regular', color: COLORS.chart.textSecondary }}
        >
          {value}
        </Text>
        <View className="h-[1px] w-2 shrink-0" style={{ backgroundColor: COLORS.chart.separator }} />
        <Text 
          className="text-[11px] md:text-[12px]" 
          style={{ fontFamily: 'DMSans_700Bold', color: COLORS.chart.textPrimary }}
        >
          {percentage}
        </Text>
      </View>
    </View>
  );
};

interface VisitorDistributionChartProps {
  stats?: {
    total: number;
    internal: number;
    external: number;
    blocked: number;
    cancelled: number;
  };
}

export default function VisitorDistributionChart({ stats }: VisitorDistributionChartProps) {
  // Use provided stats or fallback to hardcoded ones for now
  const internalVal = stats?.internal || 0;
  const externalVal = stats?.external || 0;
  const blockedVal = stats?.blocked || 0;
  const cancelledVal = stats?.cancelled || 0;
  const totalVal = Math.max(1, internalVal + externalVal + blockedVal + cancelledVal); // Avoid div by 0

  const getPercentage = (value: number) => `${Math.round((value / totalVal) * 100)}%`;

  const hasData = (internalVal + externalVal + blockedVal + cancelledVal) > 0;
  
  const pieData = hasData ? [
    { value: cancelledVal, color: COLORS.chart.cancelled },
    { value: blockedVal, color: COLORS.chart.blocked },
    { value: internalVal, color: COLORS.chart.internal },
    { value: externalVal, color: COLORS.chart.external },
  ] : [
    { value: 1, color: '#e5e5e5' } // Empty state pie
  ];

  return (
    <VStack className="w-full bg-bg-main rounded-[16px] p-4 flex-col gap-4 overflow-hidden">
      {/* Header */}
      <HStack className="items-center justify-between">
        <Text 
          className="text-[16px] leading-[1.2] tracking-[-0.64px] text-[#292929]" 
          style={{ fontFamily: 'DMSans_600SemiBold' }}
        >
          Ziyaretçi Dağılımı
        </Text>
        <View className="px-1 py-1.5">
          <Text 
            className="text-[12px] leading-none text-[#0e4d41] text-center capitalize" 
            style={{ fontFamily: 'DMSans_500Medium' }}
          >
            {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(new Date())}
          </Text>
        </View>
      </HStack>

      {/* Body */}
      <View className="justify-center w-full">
        <View className="w-full flex-col md:flex-row justify-between gap-6 md:gap-0">
        
        {/* 1. Kısım: Grafik */}
        <View className="w-full md:flex-1 items-center justify-center">
          <View className="h-[156px] w-[156px] items-center justify-center">
            <PieChart
              donut
              data={pieData}
              radius={78}
              innerRadius={50}
              strokeWidth={2}
              strokeColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* 2. ve 3. Kısım: Metinler */}
        <View className="w-full md:flex-[2] flex-row justify-between mt-6 md:mt-0 px-1">
          {/* Column 1 */}
          <View className="flex-col gap-5 w-[49%]">
            <LegendItem 
              color={COLORS.chart.cancelled}
              title="İptal Edilen Ziyaretler" 
              value={cancelledVal.toString()} 
              percentage={hasData ? getPercentage(cancelledVal) : '0%'} 
              icon={UserX} 
              iconColor={COLORS.chart.internal} 
            />
            <LegendItem 
              color={COLORS.chart.blocked} 
              title="Engellenen Ziyaretler" 
              value={blockedVal.toString()} 
              percentage={hasData ? getPercentage(blockedVal) : '0%'} 
              icon={ShieldOff} 
              iconColor={COLORS.chart.blocked} 
            />
          </View>
          
          {/* Column 2 */}
          <View className="flex-col gap-5 w-[49%]">
            <LegendItem 
              color={COLORS.chart.internal} 
              title="Kurum İçi Ziyaretler" 
              value={internalVal.toString()} 
              percentage={hasData ? getPercentage(internalVal) : '0%'} 
              icon={Building2} 
              iconColor={COLORS.chart.internal} 
            />
            <LegendItem 
              color={COLORS.chart.external} 
              title="Kurum Dışı Ziyaretler" 
              value={externalVal.toString()} 
              percentage={hasData ? getPercentage(externalVal) : '0%'} 
              icon={Globe} 
              iconColor={COLORS.chart.internal} 
            />
          </View>
        </View>

        </View>
      </View>
    </VStack>
  );
}
