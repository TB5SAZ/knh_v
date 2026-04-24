import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useAuth } from '@/src/providers/AuthProvider';
import { TARGET_DEPARTMENTS } from '@/src/constants/departments';

export interface BlacklistData {
  id: string;
  tcNo: string;
  name: string;
  blockerName: string;
  blockerTitle: string;
  reason: string;
  personnelId: string;
}

interface BlacklistCardProps {
  data: BlacklistData;
  cardWidth?: number;
  onDelete?: (id: string) => void;
}

export function BlacklistCard({ data, cardWidth, onDelete }: BlacklistCardProps) {
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin' || profile?.department_id === TARGET_DEPARTMENTS.ADMIN_DEPT_ID;
  const isSecurity = profile?.department_id === TARGET_DEPARTMENTS.SECURITY_DEPT_ID;
  const isSecretary = profile?.department_id === TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID;
  
  const canDelete = isAdmin || (!isSecurity && !isSecretary && profile?.id === data.personnelId);

  return (
    <View 
      className="bg-white rounded-[16px] pt-[10px] pb-[16px] px-[16px] flex-col gap-[10px]"
      style={{ 
        width: cardWidth ? cardWidth : 270, 
        flexGrow: 1,
        flexShrink: 0
      }}
    >
      {/* Upper Section */}
      <View className="relative h-[59px] w-full items-center justify-center">
        {/* Top Right Action Button */}
        {canDelete && (
          <Pressable 
            className="absolute top-0 right-0 p-[10px] z-50"
            onPress={() => onDelete && onDelete(data.id)}
          >
            <Trash2 size={18} color="#a4acab" />
          </Pressable>
        )}

        {/* Info */}
        <View className="flex-col items-center justify-center mt-[12px]">
          <Text className="font-normal text-[#63716e] text-[12px] leading-[1.3] mb-[3px]" style={{ fontFamily: 'DMSans_400Regular' }}>
            {data.tcNo}
          </Text>
          <Text className="font-bold text-[#203430] text-[18px] tracking-[-0.72px] leading-[1.2]" style={{ fontFamily: 'DMSans_700Bold' }}>
            {data.name}
          </Text>
        </View>
      </View>

      {/* Bottom Gray Box */}
      <View className="bg-[#f7f7f7] rounded-[12px] py-[12px] flex-col gap-[12px] w-full">
        {/* Blocker Row */}
        <View className="flex-row items-center px-[10px] w-full">
          <Text className="font-normal text-[#63716e] text-[11px] w-[70px]" style={{ fontFamily: 'DMSans_400Regular' }}>
            Engelleyen
          </Text>
          <View className="flex-col justify-center flex-1">
            <Text className="font-medium text-[#292929] text-[11px] mb-[2px]" style={{ fontFamily: 'DMSans_500Medium' }}>
              {data.blockerName}
            </Text>
            <Text className="font-normal text-[#757575] text-[10px]" style={{ fontFamily: 'DMSans_400Regular' }}>
              {data.blockerTitle}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-slate-200 w-full" />

        {/* Reason Row */}
        <View className="flex-row items-center px-[10px] w-full">
          <Text className="font-normal text-[#63716e] text-[11px] w-[70px]" style={{ fontFamily: 'DMSans_400Regular' }}>
            Nedeni
          </Text>
          <Text className="font-medium text-[#203430] text-[11px] flex-1 leading-[1.3]" style={{ fontFamily: 'DMSans_500Medium' }}>
            {data.reason}
          </Text>
        </View>
      </View>
    </View>
  );
}
