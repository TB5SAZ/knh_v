import React from 'react';
import { View, Text, Pressable as NativePressable } from 'react-native';
import { CustomBadge } from '../../ui/CustomBadge';
import { CustomAvatar } from '../../ui/CustomAvatar';
import { Pencil, Trash2, ShieldOff } from 'lucide-react-native';
import { TableActionBadge } from '../../core/TableActionBadge';
import { VisitorData } from '../../../types/visitor';

interface VisitorTableRowProps {
  item: VisitorData;
  isCompact: boolean;
  isActionsRestricted: boolean;
  activeRowId: string | null;
  setActiveRowId: (id: string | null) => void;
}

export const VisitorTableRow = ({
  item,
  isCompact,
  isActionsRestricted,
  activeRowId,
  setActiveRowId
}: VisitorTableRowProps) => {
  const isInternalBg = item.isInternal ? 'bg-[#f8fcf3]' : 'bg-white';
  const actionWidth = isActionsRestricted ? 'w-[50px]' : 'w-[130px]';
  const translateXHover = isActionsRestricted ? 'xl:group-hover:translate-x-[50px]' : 'xl:group-hover:translate-x-[130px]';
  const translateXActive = isActionsRestricted ? 'translate-x-[50px]' : 'translate-x-[130px]';

  return (
    <NativePressable
      onLongPress={() => setActiveRowId(item.id)}
      delayLongPress={250}
      onPress={() => {
        if (activeRowId === item.id) setActiveRowId(null);
      }}
      className={`group h-[56px] border-b border-[#e5e6e6] w-full relative overflow-hidden ${isInternalBg}`}
    >
      {/* Sol Taraf Eylemler (Arkaplan) */}
      <View className={`absolute left-0 top-0 bottom-0 ${actionWidth} flex-row items-center justify-start gap-[8px] pl-[10px]`}>
        <TableActionBadge 
          theme="solid"
          actionType="neutral" 
          icon={Pencil} 
        />
        {!isActionsRestricted && (
          <>
            <TableActionBadge 
              theme="solid"
              actionType="error" 
              icon={ShieldOff} 
            />
            <TableActionBadge 
              theme="solid"
              actionType="warning" 
              icon={Trash2} 
            />
          </>
        )}
      </View>

      {/* Kayan İçerik (Foreground) */}
      <View 
        className={`flex-1 flex-row items-center justify-between pr-2 gap-[24px] px-[10px] w-full h-[56px] transition-transform duration-300 ease-in-out ${isInternalBg} ${
          activeRowId === item.id ? translateXActive : ('translate-x-0 ' + translateXHover)
        }`}
      >
        {/* Ziyaret Eden */}
        <View className="flex-row items-center w-[160px] shrink-0 gap-[10px]">
          <CustomAvatar name={item.visitorName || '?'} size="sm" />
          <View className="flex-col items-start justify-center flex-1 gap-[3px]">
            <Text className="text-[11px] text-[#292929] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
              {item.visitorName || '-'}
            </Text>
            <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
              {item.visitorTitle}
            </Text>
          </View>
        </View>

        {/* Ziyaret Edilen */}
        <View className="flex-col items-start justify-center w-[120px] shrink-0 gap-[3px]">
          <Text className="text-[11px] text-[#292929] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
            {item.hostName || '-'}
          </Text>
          <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
            {item.hostTitle}
          </Text>
        </View>

        {/* Tarih & Saat */}
        {isCompact ? (
          <View className="flex-col items-start justify-center w-[100px] shrink-0 gap-[3px]">
            <Text className="text-[11px] text-[#292929] font-medium leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_500Medium' }}>
              {item.date || '-'}
            </Text>
            <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
              {item.time || '-'}
            </Text>
          </View>
        ) : (
          <>
            <View className="flex-col items-start justify-center w-[87px] shrink-0">
              <Text className="text-[11px] text-[#292929] font-normal leading-[1.3]" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                {item.date || '-'}
              </Text>
            </View>
            <View className="flex-col items-start justify-center w-[40px] shrink-0">
              <Text className="text-[11px] text-[#292929] font-normal leading-[1.3]" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                {item.time || '-'}
              </Text>
            </View>
          </>
        )}

        {/* Konu */}
        <View className={`flex-col items-start justify-center shrink-0 mr-4 ${isCompact ? 'w-[230px]' : 'w-[430px]'}`}>
          <View className={`bg-[#f7f7f7] px-[6px] py-[4px] rounded-[3px] w-full ${isCompact ? 'min-h-[36px]' : ''}`}>
            <Text className="text-[11px] text-[#203430] font-normal leading-[1.3]" numberOfLines={isCompact ? 2 : 1} style={{ fontFamily: 'DMSans_400Regular' }}>
              {item.subject || '-'}
            </Text>
          </View>
        </View>

        {/* Durum */}
        <View className="flex-col items-start justify-center w-[80px] shrink-0">
          <CustomBadge status={item.status} className="shrink-0" />
        </View>
      </View>
    </NativePressable>
  );
};
