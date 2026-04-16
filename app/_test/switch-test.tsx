import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSwitch } from '@/src/components/ui/AppSwitch';

export default function SwitchTestScreen() {
  const [isOn, setIsOn] = useState(true);
  const [isOff, setIsOff] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center max-w-sm mx-auto w-full space-y-12">
        <View className="mb-8">
          <Text className="text-heading-24-bold text-text-primary mb-2 text-center">
            Atomik Switch Testi
          </Text>
          <Text className="text-body-14-regular text-text-secondary text-center">
            Renk haritasının pürüzsüz geçişini görmek için dokunun.
          </Text>
        </View>

        {/* Açık Durum Testi */}
        <View className="flex-row items-center justify-between bg-bg-surface p-4 rounded-xl border border-border-default">
          <View>
            <Text className="text-body-16-regular text-text-primary mb-1">
              Bildirimleri Al (State: {isOn ? 'Açık' : 'Kapalı'})
            </Text>
            <Text className="text-body-12-regular text-text-secondary">
              Yeni mesajlar geldiğinde bana bildir.
            </Text>
          </View>
          <AppSwitch 
            value={isOn} 
            onToggle={setIsOn} 
            size="md"
          />
        </View>

        {/* Kapalı Durum Testi */}
        <View className="flex-row items-center justify-between bg-bg-surface p-4 rounded-xl border border-border-default mt-4">
          <View>
            <Text className="text-body-16-regular text-text-primary mb-1">
              Görünmez Mod (State: {isOff ? 'Açık' : 'Kapalı'})
            </Text>
            <Text className="text-body-12-regular text-text-secondary">
              Profilimi diğer kullanıcılara gizle.
            </Text>
          </View>
          <AppSwitch 
            value={isOff} 
            onToggle={setIsOff} 
            size="lg"
          />
        </View>

        {/* Pasif Durum Testi */}
        <View className="flex-row items-center justify-between bg-bg-surface p-4 rounded-xl border border-border-default mt-4 opacity-70">
          <View>
            <Text className="text-body-16-regular text-text-primary mb-1">
              Pasif Seçenek
            </Text>
            <Text className="text-body-12-regular text-text-secondary">
              Bu seçenek şimdilik değiştirilemez.
            </Text>
          </View>
          <AppSwitch 
            value={true} 
            onToggle={() => {}} 
            isDisabled={true}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}
