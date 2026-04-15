import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { AppDateTimePicker } from '@/src/components/core/AppDateTimePicker';
import { AppTextarea } from '@/src/components/core/AppTextarea';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';

interface VisitorDetailsInfoProps {
  control: Control<VisitorFormValues>;
  errors: FieldErrors<VisitorFormValues>;
  isMobile: boolean;
  isSecurity: boolean;
}

export const VisitorDetailsInfo: React.FC<VisitorDetailsInfoProps> = ({
  control,
  errors,
  isMobile,
  isSecurity
}) => {
  return (
    <View className="flex-col gap-3">
      <View className="h-6 justify-center">
        <Text className="text-heading-14-semibold text-text-primary">Ziyaret Bilgileri</Text>
      </View>
      
      <View className="flex-col gap-4">
        <View className="flex-col md:flex-row gap-4">
          <View className="flex-1">
            <Controller
              control={control}
              name="visitDate"
              render={({ field: { onChange, value } }) => (
                <AppDateTimePicker 
                  label="Ziyaret Tarihi" 
                  mode="date"
                  leftIcon={isMobile ? Calendar : undefined}
                  rightIcon={!isMobile ? Calendar : undefined}
                  value={value}
                  onChange={onChange}
                  error={errors.visitDate?.message}
                  disabled={isSecurity}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="visitTime"
              render={({ field: { onChange, value } }) => (
                <AppDateTimePicker 
                  label="Ziyaret Saati" 
                  mode="time"
                  leftIcon={Clock}
                  value={value}
                  onChange={onChange}
                  error={errors.visitTime?.message}
                  disabled={isSecurity}
                />
              )}
            />
          </View>
        </View>

        <View className="w-full">
          <Controller
            control={control}
            name="visitReason"
            render={({ field: { onChange, value } }) => (
              <AppTextarea 
                label="Ziyaret Nedeni" 
                placeholder="Ziyaret Nedenini Giriniz" 
                value={value}
                onChangeText={(text) => {
                  const formatted = text ? text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1) : '';
                  onChange(formatted);
                }}
                error={errors.visitReason?.message}
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};
