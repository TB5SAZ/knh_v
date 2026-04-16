import { AppAlertStatus } from '@/src/components/core/AppAlert';
import { BREAKPOINTS } from '@/src/constants/theme';
import { useAuth } from '@/src/providers/AuthProvider';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export function useLoginScreen() {
  const { width } = useWindowDimensions();

  // State Management (Gizli Şalter & Loading)
  const tapCountRef = useRef(0);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    status: AppAlertStatus;
    title: string;
    description: string;
  }>({
    isOpen: false,
    status: 'info',
    title: '',
    description: '',
  });

  const { session, role, isLoading: isAuthLoading } = useAuth();

  // Bu ref, kullanıcı yeni kayıt olduğunda otomatik login yönlendirmesini engellemek için kullanılır.
  const justRegisteredRef = useRef(false);

  useEffect(() => {
    if (!isAuthLoading && session && !justRegisteredRef.current) {
      // React Native (Expo Router) state güncellendiği saniyede (örn: Login Butonu animasyonu biter bitmez)
      // yapılan yönlendirmeleri yutabilir. Bu sebeple 100ms'lik minik bir garanti bekleyişi ekliyoruz.
      setTimeout(() => {
        let targetRoute = '/dashboard'; // Default fallback

        if (role) {
          // Sistemin profile.role yapısına göre ilk yönlendirme karar ağacı
          if (role === 'Sistem Yöneticisi') {
            targetRoute = '/dashboard';
          } else if (role === 'Kayıt Görevlisi' || role === 'Güvenlik Personeli' || role === 'Sekreter') {
            targetRoute = '/visitors';
          } else {
            targetRoute = '/appointments';
          }
        }

        router.replace(targetRoute as any);
      }, 100);
    }
  }, [session, isAuthLoading, role]);

  // Tablet or Desktop handling via Tailwind breakpoint logics
  const isDesktop = width >= BREAKPOINTS.lg;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;

  // Dynamic padding based on responsive state
  const horizontalPadding = useMemo(() => {
    if (width >= BREAKPOINTS.xl) return 120;
    if (isDesktop) return 40; // Desktop
    if (isTablet) return 120; // Tablet
    return 24; // Mobile
  }, [width, isDesktop, isTablet]);

  const handleLogoPress = useCallback(() => {
    tapCountRef.current += 1;
    if (tapCountRef.current >= 12) {
      setIsRegisterMode(true);
      tapCountRef.current = 0;
    }
  }, []);

  return {
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
  };
}
