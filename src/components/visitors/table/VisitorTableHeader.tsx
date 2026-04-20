import React from 'react';
import { View, Text } from 'react-native';

interface VisitorTableHeaderProps {
  isCompact: boolean;
}

export const VisitorTableHeader = ({ isCompact }: VisitorTableHeaderProps) => {
  return (
    <View className={`flex-row items-center gap-[24px] bg-[#f7f7f7] px-[10px] rounded-lg mb-[4px] w-full ${isCompact ? 'h-[44px]' : 'h-[56px]'}`}>
      <View className="flex-1 flex-row items-center justify-between pr-2">
        <View className="flex-col items-start justify-center w-[160px] shrink-0">
          <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Ziyaret Eden</Text>
        </View>
        <View className="flex-col items-start justify-center w-[120px] shrink-0">
          <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Ziyaret Edilen</Text>
        </View>

        {isCompact ? (
          <View className="flex-col items-start justify-center w-[100px] shrink-0">
            <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Tarih / Saat</Text>
          </View>
        ) : (
          <>
            <View className="flex-col items-start justify-center w-[87px] shrink-0">
              <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Tarih</Text>
            </View>
            <View className="flex-col items-start justify-center w-[40px] shrink-0">
              <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Saat</Text>
            </View>
          </>
        )}

        <View className={`flex-col items-start justify-center shrink-0 mr-4 ${isCompact ? 'w-[230px]' : 'w-[430px]'}`}>
          <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Konu</Text>
        </View>
        <View className="flex-col items-start justify-center w-[80px] shrink-0">
          <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Durum</Text>
        </View>
      </View>
    </View>
  );
};
