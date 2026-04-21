import React from 'react';
import { Slot, Redirect, usePathname } from 'expo-router';
import { useAuth } from '@/src/providers/AuthProvider';
import { View, useWindowDimensions } from 'react-native';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { COLORS } from '@/src/constants/theme';

export default function AppLayout() {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Tailwind 'md' breakpoint
  const isTablet = width >= 768 && width < 1280; // Tailwind 'xl' breakpoint

  // Authentication Loading State
  if (isLoading) {
    return <LoadingSpinner size="large" color={COLORS.brandPrimary} className="bg-bg-main" />;
  }

  // Route Flashing / Render-Blocking Protection (Security Gate)
  if (!session) {
    return <Redirect href="/" />;
  }

  const ROUTE_MAP: Record<string, { title: string; isMainPage?: boolean; breadcrumbItems?: { label: string; href?: string }[] }> = {
    '/visitors': { title: 'Ziyaretçiler' },
    '/appointments': { title: 'Randevular' },
    '/blacklist': { title: 'Kara Liste' },
    '/settings': { title: 'Kontrol Paneli / Ayarlar' },
    '/dashboard': { title: 'Ana Sayfa' },
    '/keygen': { title: 'Davet Anahtarı Üret' },
    '/visitors/add': {
      title: 'Ziyaretçi Ekle',
      isMainPage: false,
      breadcrumbItems: [
        { label: 'Ziyaretçiler', href: '/visitors' },
        { label: 'Ziyaretçi Ekle' }
      ]
    }
  };

  let title = "Detaylar";
  let isMainPage = false;
  let breadcrumbItems: { label: string; href?: string }[] = [];

  const exactMatch = ROUTE_MAP[pathname];
  if (exactMatch) {
    title = exactMatch.title;
    isMainPage = exactMatch.isMainPage ?? true;
    breadcrumbItems = exactMatch.breadcrumbItems || [];
  } else if (pathname.startsWith('/visitors/edit')) {
    title = "Ziyaretçi Düzenle";
    breadcrumbItems = [
      { label: 'Ziyaretçiler', href: '/visitors' },
      { label: 'Ziyaretçi Düzenle' }
    ];
  } else if (pathname === '/') {
    // Default fallback for root inside (app)
    title = "Ana Sayfa";
    isMainPage = true;
  }

  // Authorized Access Only
  return (
    <View className="flex-row h-full bg-bg-surface w-full overflow-hidden">
      {!isMobile && (
        <Sidebar isCollapsed={isTablet} />
      )}
      <View className="flex-1 flex-col h-full">
        <Header title={title} isMainPage={isMainPage} breadcrumbItems={breadcrumbItems} />
        <View className="flex-1 overflow-hidden">
          <Slot />
        </View>
      </View>
    </View>
  );
}
