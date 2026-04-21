import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Controller, Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { AppInput } from '@/src/components/core/AppInput';
import { AppCheckbox } from '@/src/components/core/AppCheckbox';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';
import { maskTc } from '@/src/utils/validations';
import { VisitorAutocompleteDropdown } from './VisitorAutocompleteDropdown';
import { Visitor } from '@/src/types/visitor';

interface VisitorPersonalInfoProps {
  control: Control<VisitorFormValues>;
  errors: FieldErrors<VisitorFormValues>;
  setValue: UseFormSetValue<VisitorFormValues>;
  isExternal: boolean;
  isForeign: boolean;
  firstNameVal: string;
  lastNameVal: string;
  titleVal: string;
  searchVisitors: (f: string, l: string, t: string, source: 'name' | 'title') => void;
  showSuggestions: boolean;
  activeSearchField: 'name' | 'title' | null;
  nameSuggestions: Visitor[];
  onSelectVisitor: (visitor: Visitor) => void;
  isEditMode?: boolean;
}

export const VisitorPersonalInfo: React.FC<VisitorPersonalInfoProps> = ({
  control,
  errors,
  setValue,
  isExternal,
  isForeign,
  firstNameVal,
  lastNameVal,
  titleVal,
  searchVisitors,
  showSuggestions,
  activeSearchField,
  nameSuggestions,
  onSelectVisitor,
  isEditMode = false
}) => {
  return (
    <View className={`flex-col gap-3 ${isEditMode ? 'opacity-80' : ''}`}>
      <View className="h-6 justify-center">
        <Text className="text-heading-14-semibold text-text-primary">Ziyaret Edenin</Text>
      </View>
      
      <View className="flex-col gap-4">
        <View className="relative z-50">
          <View className="flex-col md:flex-row gap-4">
            <View className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <AppInput 
                    label="Adı" 
                    placeholder="Ziyaretçinin Adını Giriniz" 
                    value={value}
                    editable={!isEditMode}
                    onChangeText={(text) => {
                      const formatted = text.split(' ').map(word => 
                        word ? word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR') : ''
                      ).join(' ');
                      onChange(formatted);
                      setValue('existingVisitorId', '');
                      searchVisitors(formatted, lastNameVal, titleVal, 'name');
                    }}
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <AppInput 
                    label="Soyadı" 
                    placeholder="Ziyaretçinin Soyadını Giriniz" 
                    value={value}
                    editable={!isEditMode}
                    onChangeText={(text) => {
                      const formatted = text.toLocaleUpperCase('tr-TR');
                      onChange(formatted);
                      setValue('existingVisitorId', '');
                      searchVisitors(firstNameVal, formatted, titleVal, 'name');
                    }}
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Autocomplete Suggestions Dropdown */}
          {!isEditMode && showSuggestions && activeSearchField === 'name' && nameSuggestions.length > 0 && (
             <VisitorAutocompleteDropdown 
               suggestions={nameSuggestions} 
               onSelect={onSelectVisitor} 
               zIndexClass="z-50" 
             />
          )}
        </View>

        <View className="flex-col md:flex-row gap-4 relative z-40">
          <View className="flex-1">
            {!isExternal ? (
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <View className="relative z-[9999]">
                    <AppInput 
                      label="Ünvan" 
                      placeholder="Ziyaretçinin Ünvanını Giriniz" 
                      value={value}
                      editable={!isEditMode}
                      onChangeText={(text) => {
                        const formatted = text.split(' ').map(word => 
                          word ? word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR') : ''
                        ).join(' ');
                        onChange(formatted);
                        setValue('existingVisitorId', '');
                        searchVisitors(firstNameVal, lastNameVal, formatted, 'title');
                      }}
                      error={errors.title?.message}
                    />
                    {/* Title Suggestions Dropdown */}
                    {!isEditMode && showSuggestions && activeSearchField === 'title' && nameSuggestions.length > 0 && (
                      <VisitorAutocompleteDropdown 
                        suggestions={nameSuggestions} 
                        onSelect={onSelectVisitor} 
                        zIndexClass="z-[9999]" 
                      />
                    )}
                  </View>
                )}
              />
            ) : (
              <Controller
                control={control}
                name="tcNo"
                render={({ field: { onChange, value } }) => (
                  <AppInput 
                    label={isForeign ? "Pasaport No" : "T.C. Kimlik No"} 
                    placeholder={isForeign ? "Pasaport Numarasını Giriniz" : "Ziyaretçinin Kimlik Numarasını Giriniz"} 
                    keyboardType={isForeign ? "default" : "numeric"}
                    maxLength={isForeign ? undefined : 11}
                    value={value}
                    editable={!isEditMode}
                    onChangeText={onChange}
                    error={errors.tcNo?.message}
                  />
                )}
              />
            )}
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <AppInput 
                  label="Telefon Numarası" 
                  placeholder="Ziyaretçinin Telefon Numarasını Giriniz" 
                  keyboardType="phone-pad" 
                  value={value}
                  editable={!isEditMode}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="w-full">
          <Controller
            control={control}
            name="isForeign"
            render={({ field: { onChange, value } }) => (
              <AppCheckbox 
                value="foreign" 
                label="Yabancı Uyruklu Ziyaretçi" 
                isChecked={value}
                isDisabled={isEditMode}
                onChange={(checked) => onChange(checked)}
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};
