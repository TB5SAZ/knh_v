import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppAlert } from '@/src/components/core/AppAlert';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { BREAKPOINTS } from '@/src/constants/theme';

import { LoginForm } from '@/src/components/forms/LoginForm';
import { RegisterForm } from '@/src/components/forms/RegisterForm';
import { useLoginScreen } from '@/src/hooks/useLoginScreen';
import { useSplashAnimation } from '@/src/hooks/useSplashAnimation';

// SVG Logos stored in assets/logos
const logoVertical = require('@/assets/logos/hst_logo_vertical.svg');
const logoAppIcon = require('@/assets/logos/logo_app_icon.svg');

// TODO: Translate these via expo-localization or i18next in the future
const I18N_TEXTS = {
  title: 'Ziyaret ve Randevu Takip Sistemi',
  registerDescription: 'Kayıt olmak için lütfen aşağıdaki bilgileri eksiksiz doldurunuz.',
  loginDescription: 'Lütfen giriş yapmak için bilgilerinizi giriniz.',
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  
  const {
    isRegisterMode,
    setIsRegisterMode,
    isLoading,
    setIsLoading,
    alertState,
    setAlertState,
    justRegisteredRef,
    isDesktop,
    horizontalPadding,
    handleLogoPress
  } = useLoginScreen();

  const isTabletState = windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg;

  const logoDims = useMemo(() => {
    if (isDesktop) return { width: 400, height: 331 };
    if (isTabletState) return { width: 280, height: 231 };
    return { width: 220, height: 182 };
  }, [isDesktop, isTabletState]);

  const { 
    showSpinner, 
    isSplashComplete, 
    greenPanelStyle, 
    rightPanelStyle 
  } = useSplashAnimation(isDesktop, windowHeight);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, [setAlertState]);

  return (
    <View className="flex-1 bg-bg-main relative">
      <View className={`flex-1 flex-row ${isDesktop ? '' : 'justify-center'} relative overflow-hidden`}>
        
        {/* Left Green Panel (Splash Screen) */}
        {(isDesktop || !isSplashComplete) && (
          <Animated.View style={greenPanelStyle}>
            <View className="flex-1 bg-brand-primary items-center justify-center p-16">
              <Image 
                source={logoVertical} 
                style={{ width: logoDims.width, height: logoDims.height }} 
                contentFit="contain" 
              />
              {showSpinner && (
                <LoadingSpinner 
                  size="large" 
                  color="#ffffff"
                  className="absolute"
                  style={{ top: '50%', marginTop: (logoDims.height / 2) + 24 }} 
                />
              )}
            </View>
          </Animated.View>
        )}

        {/* Right Form Panel */}
        <Animated.View className={isDesktop ? "" : "flex-1"} style={rightPanelStyle}>
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Math.max(insets.top, 64),
              paddingBottom: Math.max(insets.bottom, 64),
              paddingHorizontal: horizontalPadding,
            }}
          >
            <View className="w-full max-w-[420px] gap-10 items-center">
              
              {/* Header Area */}
              <View className="items-center gap-2 w-full">
                <Pressable 
                  onPress={handleLogoPress} 
                  className="w-[64px] h-[64px] mb-[32px]"
                  accessibilityRole="button"
                  accessibilityLabel="Uygulama logosu"
                >
                  <Image 
                    source={logoAppIcon} 
                    style={{ width: '100%', height: '100%' }} 
                    contentFit="contain" 
                  />
                </Pressable>
                
                <Text className="text-heading-16-semibold text-text-primary text-center tracking-[-0.64px]">
                  {I18N_TEXTS.title}
                </Text>
                
                <Animated.Text 
                  key={isRegisterMode ? 'register-text' : 'login-text'}
                  entering={FadeIn.duration(400)}
                  className="text-body-12-regular text-text-secondary text-center"
                >
                  {isRegisterMode ? I18N_TEXTS.registerDescription : I18N_TEXTS.loginDescription}
                </Animated.Text>
              </View>

              {/* Conditional Rendering: Login UI vs Register UI */}
              <Animated.View 
                key={isRegisterMode ? 'register-form' : 'login-form'}
                entering={FadeIn.duration(400)}
                style={{ width: '100%' }}
              >
                {!isRegisterMode ? (
                  <LoginForm 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading} 
                    setAlertState={setAlertState} 
                    justRegisteredRef={justRegisteredRef}
                  />
                ) : (
                  <RegisterForm 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading} 
                    setAlertState={setAlertState} 
                    onBackToLogin={() => setIsRegisterMode(false)}
                    justRegisteredRef={justRegisteredRef}
                  />
                )}
              </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      <AppAlert 
        isOpen={alertState.isOpen}
        status={alertState.status}
        title={alertState.title}
        description={alertState.description}
        onClose={closeAlert}
      />
    </View>
  );
}
