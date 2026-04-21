import React from 'react';
import { View, Text } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const badgeStyle = tva({
  base: 'flex-row h-[18px] items-center justify-center px-[8px] py-[3px] rounded-full',
  variants: {
    status: {
      success: 'bg-[#35BFA3]',
      pending: 'bg-[#A4ACAB]',
      cancelled: 'bg-[#0E4D41]',
      blocked: 'bg-[#E63D4B]',
      deleted: 'bg-[#6B7280]',
    },
  },
  defaultVariants: {
    status: 'success',
  },
});

const badgeTextStyle = tva({
  base: 'font-body font-normal text-white text-[11px] leading-[1.3] text-center',
});

export type CustomBadgeStatus = 'success' | 'pending' | 'cancelled' | 'blocked' | 'deleted';

export interface CustomBadgeProps {
  status: CustomBadgeStatus;
  className?: string;
}

const statusTextMap: Record<CustomBadgeStatus, string> = {
  success: 'Başarılı',
  pending: 'Bekleniyor',
  cancelled: 'İptal Edildi',
  blocked: 'Engellendi',
  deleted: 'Silindi',
};

export const CustomBadge = ({ status, className }: CustomBadgeProps) => {
  return (
    <View className={badgeStyle({ status, class: className })}>
      <Text className={badgeTextStyle({})} style={{ fontFamily: 'DMSans_400Regular' }}>
        {statusTextMap[status]}
      </Text>
    </View>
  );
};

export default CustomBadge;
