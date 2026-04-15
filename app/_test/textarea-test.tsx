import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppInput } from '@/src/components/core/AppInput';
import { AppTextarea } from '@/src/components/core/AppTextarea';

export default function TextareaTestScreen() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <View className="flex-1 bg-bg-main" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 24 }}
      >
        <AppInput
          label="Ad Soyad"
          placeholder="Adınızı giriniz..."
          value={inputValue}
          onChangeText={setInputValue}
        />

        <AppTextarea
          label="Açıklama"
          placeholder="Detaylı açıklama giriniz..."
          value={textareaValue}
          onChangeText={setTextareaValue}
          numberOfLines={6}
        />
        
        {/* Error States */}
        <AppInput
          label="Ad Soyad (Hatalı)"
          placeholder="Adınızı giriniz..."
          value={inputValue}
          onChangeText={setInputValue}
          error="Bu alan zorunludur"
        />

        <AppTextarea
          label="Açıklama (Hatalı)"
          placeholder="Detaylı açıklama giriniz..."
          value={textareaValue}
          onChangeText={setTextareaValue}
          numberOfLines={4}
          error="Açıklama çok kısa"
        />
      </ScrollView>
    </View>
  );
}
