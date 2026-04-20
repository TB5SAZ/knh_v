import React from 'react';
import { View } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { VStack } from '@/src/components/ui/vstack';
import { Text } from '@/src/components/ui/text';
import { PieChart } from 'react-native-gifted-charts';
import { UserX, ShieldOff, Building2, Globe } from 'lucide-react-native';

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
    <VStack className="flex-1 gap-1">
      <HStack className="items-center gap-2">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <Text 
          className="text-[12px] text-[#203430]" 
          style={{ fontFamily: 'DMSans_400Regular' }}
        >
          {title}
        </Text>
      </HStack>
      <HStack className="items-center gap-1.5 ml-4">
        <Icon size={16} color={iconColor} />
        <Text 
          className="text-[12px] text-[#63716E]" 
          style={{ fontFamily: 'DMSans_400Regular' }}
        >
          {value}
        </Text>
        <View className="h-[1px] w-2 bg-[#A4ACAB]" />
        <Text 
          className="text-[12px] text-[#203430]" 
          style={{ fontFamily: 'DMSans_700Bold' }}
        >
          {percentage}
        </Text>
      </HStack>
    </VStack>
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

  const pieData = [
    { value: cancelledVal, color: '#0E4D41' },
    { value: blockedVal, color: '#E63D4B' },
    { value: internalVal, color: '#35BFA3' },
    { value: externalVal > 0 ? externalVal : 1, color: '#E4F2D3' }, // Prevent empty pie if 0
  ];

  return (
    <VStack className="flex-1 w-full bg-bg-main rounded-[16px] p-4 flex-col gap-4">
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
      <View className="flex-1 justify-center">
        <HStack className="w-full flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        
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
        <HStack className="w-full md:flex-[2] flex-row justify-between gap-2 md:gap-0">
          {/* Column 1 */}
          <VStack className="flex-1 gap-4 items-center justify-center md:pl-2 lg:pl-12">
            <LegendItem 
              color="#0E4D41" 
              title="İptal Edilen Ziyaretler" 
              value={cancelledVal.toString()} 
              percentage={getPercentage(cancelledVal)} 
              icon={UserX} 
              iconColor="#35BFA3" 
            />
            <LegendItem 
              color="#E63D4B" 
              title="Engellenen Ziyaretler" 
              value={blockedVal.toString()} 
              percentage={getPercentage(blockedVal)} 
              icon={ShieldOff} 
              iconColor="#E63D4B" 
            />
          </VStack>
          
          {/* Column 2 */}
          <VStack className="flex-1 gap-4 items-center justify-center md:pl-2 lg:pl-8">
            <LegendItem 
              color="#35BFA3" 
              title="Kurum İçi Ziyaretler" 
              value={internalVal.toString()} 
              percentage={getPercentage(internalVal)} 
              icon={Building2} 
              iconColor="#35BFA3" 
            />
            <LegendItem 
              color="#E4F2D3" 
              title="Kurum Dışı Ziyaretler" 
              value={externalVal.toString()} 
              percentage={getPercentage(externalVal)} 
              icon={Globe} 
              iconColor="#35BFA3" 
            />
          </VStack>
        </HStack>

        </HStack>
      </View>
    </VStack>
  );
}
