import React from 'react';
import { View, Text } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import { AppSwitch } from '@/src/components/ui/AppSwitch';
import { AppButton } from '@/src/components/core/AppButton';
import { Controller, Control, UseFormSetValue } from 'react-hook-form';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';

interface VisitorHeaderProps {
  control: Control<VisitorFormValues>;
  setValue: UseFormSetValue<VisitorFormValues>;
  isExternal: boolean;
  isForeign: boolean;
  onClearSuggestions: () => void;
}

export const VisitorHeader: React.FC<VisitorHeaderProps> = ({ 
  control, 
  setValue, 
  isExternal, 
  isForeign,
  onClearSuggestions
}) => {
  const handleScanId = () => {
    setValue('firstName', 'Ahmet', { shouldValidate: true });
    setValue('lastName', 'Yılmaz', { shouldValidate: true });
    if (!isExternal) {
      setValue('title', 'Yazılım Uzmanı', { shouldValidate: true });
    } else {
      setValue('tcNo', isForeign ? 'A1234567' : '11111111110', { shouldValidate: true });
    }
    setValue('phone', '05321234567', { shouldValidate: true });
  };

  return (
    <View className="flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
      {/* Left */}
      <View className="flex-col gap-1">
        <Text className="text-heading-16-semibold text-text-primary">Ziyaretçi Ekle</Text>
        <Text className="text-body-11-regular text-text-secondary">
          Ziyaretçi bilgilerini girerek yeni bir kayıt oluşturun.
        </Text>
      </View>

      {/* Right */}
      <View className="flex-row items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-6 flex-wrap">
        <Controller
          control={control}
          name="isExternal"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row items-center gap-2">
              <AppSwitch 
                size="sm" 
                value={!value} 
                onToggle={(val) => {
                  onChange(!val);
                  onClearSuggestions();
                }} 
              />
              <Text className="text-body-12-regular text-text-primary">
                {!value ? "Kurum İçi" : "Kurum Dışı"}
              </Text>
            </View>
          )}
        />
        
        <View className="flex-shrink-1">
          <AppButton 
            size="sm"
            variant="ghost"
            title="Kimlik Tara"
            leftIcon={ScanLine}
            className="bg-[#E4F2D3]"
            onPress={handleScanId}
          />
        </View>
      </View>
    </View>
  );
};
