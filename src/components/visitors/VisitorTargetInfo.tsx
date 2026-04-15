import React from 'react';
import { View, Text } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { AlertCircle } from 'lucide-react-native';
import { AppSelect } from '@/components/ui/AppSelect';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';

interface VisitorTargetInfoProps {
  control: Control<VisitorFormValues>;
  errors: FieldErrors<VisitorFormValues>;
  departments: Array<{ label: string; value: string }>;
  targetUsers: Array<{ label: string; value: string }>;
  selectedUnitId: string;
  isLoadingUsers: boolean;
  isRestrictedSelf: boolean;
  isSecretary: boolean;
}

export const VisitorTargetInfo: React.FC<VisitorTargetInfoProps> = ({
  control,
  errors,
  departments,
  targetUsers,
  selectedUnitId,
  isLoadingUsers,
  isRestrictedSelf,
  isSecretary
}) => {
  return (
    <View className="flex-col gap-3">
      <View className="h-6 justify-center">
        <Text className="text-heading-14-semibold text-text-primary">Ziyaret Edilenin</Text>
      </View>
      
      <View className="flex-col gap-4">
        <View className="flex-col md:flex-row gap-4">
          <View className="flex-1">
            <Text className="text-body-11-medium text-text-secondary mb-1.5">Birimi</Text>
            <Controller
              control={control}
              name="unitId"
              render={({ field: { onChange, value } }) => (
                <AppSelect 
                  options={departments}
                  placeholder="Birim Seçiniz" 
                  selectedValue={value}
                  onValueChange={onChange}
                  isDisabled={isRestrictedSelf || isSecretary}
                />
              )}
            />
            {errors.unitId && (
              <View className="mt-1 flex-row items-center gap-1">
                <AlertCircle className="text-status-error-text h-[14px] w-[14px]" />
                <Text className="text-body-11-regular text-status-error-text">{errors.unitId.message}</Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-body-11-medium text-text-secondary mb-1.5">Adı Soyadı</Text>
            <Controller
              control={control}
              name="targetUserId"
              render={({ field: { onChange, value } }) => (
                <AppSelect 
                  key={selectedUnitId}
                  options={targetUsers}
                  placeholder={isLoadingUsers ? "Yükleniyor..." : "Kişi Seçiniz"} 
                  selectedValue={value}
                  onValueChange={onChange}
                  isDisabled={isRestrictedSelf || !selectedUnitId || isLoadingUsers}
                />
              )}
            />
            {errors.targetUserId && (
              <View className="mt-1 flex-row items-center gap-1">
                <AlertCircle className="text-status-error-text h-[14px] w-[14px]" />
                <Text className="text-body-11-regular text-status-error-text">{errors.targetUserId.message}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
