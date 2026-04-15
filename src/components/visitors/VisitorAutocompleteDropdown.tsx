import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { maskTc } from '@/src/utils/validations';

interface VisitorAutocompleteDropdownProps {
  suggestions: any[];
  onSelect: (visitor: any) => void;
  /** Pass the tailwind z-index class if needed to override */
  zIndexClass?: string;
}

export const VisitorAutocompleteDropdown: React.FC<VisitorAutocompleteDropdownProps> = ({
  suggestions,
  onSelect,
  zIndexClass = 'z-50'
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <View className={`absolute top-full left-0 right-0 mt-1 bg-white border border-border-default rounded-lg shadow-sm max-h-[200px] overflow-hidden ${zIndexClass}`}>
      <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
        {suggestions.map((visitor) => (
          <Pressable 
            key={visitor.id} 
            onPress={() => onSelect(visitor)}
            className="px-4 py-3 border-b border-border-default hover:bg-bg-subtle active:bg-bg-subtle flex-row items-center justify-between"
          >
            <View className="flex-col">
              <View className="flex-row items-center gap-2">
                <Text className="text-body-14-medium text-text-primary">
                  {visitor.first_name} {visitor.last_name}
                </Text>
                <View className="bg-bg-subtle px-1.5 py-0.5 rounded-sm border border-border-default">
                  <Text className="text-[9px] text-text-secondary font-medium tracking-wide">
                    {visitor.is_external ? "KURUM DIŞI" : "KURUM İÇİ"}
                  </Text>
                </View>
              </View>
              <Text className="text-body-12-regular text-text-secondary mt-0.5">
                {visitor.is_external 
                  ? (visitor.tc_no ? maskTc(visitor.tc_no) : 'T.C. Bilinmiyor') 
                  : (visitor.title || 'Ünvan Bilinmiyor')}
              </Text>
            </View>
            {visitor.is_external && visitor.is_foreign && (
              <View className="bg-bg-surface px-2 py-1 rounded-md">
                <Text className="text-body-11-medium text-text-secondary">Yabancı</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
