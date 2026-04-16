import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppInput } from '@/src/components/core/AppInput';
import { AppSelect } from '@/src/components/core/AppSelect';

export default function SelectTestScreen() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const selectOptions = [
    { label: 'Kardiyoloji', value: '1' },
    { label: 'Dahiliye', value: '2' },
    { label: 'Nöroloji', value: '3' },
    { label: 'Ortopedi', value: '4' },
  ];

  return (
    <View className="flex-1 bg-bg-main" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 32 }}
      >
        <View className="gap-4">
          <AppInput
            label="Standart Input"
            placeholder="Bir şeyler yazın..."
            value={inputValue}
            onChangeText={setInputValue}
          />

          <View className="gap-1.5">
            <AppSelect
              placeholder="Bölüm Seçiniz..."
              options={selectOptions}
              selectedValue={selectedValue}
              onValueChange={setSelectedValue}
            />
          </View>
        </View>

        <View className="gap-4">
          <AppInput
            label="Focus Testi (Input)"
            placeholder="Focus durumunu görün..."
            value={inputValue}
            onChangeText={setInputValue}
          />

          <View className="gap-1.5">
            <AppSelect
              placeholder="Bölüm Seçiniz..."
              options={selectOptions}
              selectedValue={selectedValue}
              onValueChange={setSelectedValue}
              isDisabled={true}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
