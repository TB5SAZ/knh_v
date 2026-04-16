import React from 'react';
import { Slot, Redirect, usePathname } from 'expo-router';
import { useAuth } from '@/src/providers/AuthProvider';
import { View, useWindowDimensions } from 'react-native';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

export default function AppLayout() {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Tailwind 'md' breakpoint
  const isTablet = width >= 768 && width < 1280; // Tailwind 'xl' breakpoint

  // Authentication Loading State
  if (isLoading) {
    return <LoadingSpinner size="large" color="#008080" className="bg-bg-main" />;
  }

  // Route Flashing / Render-Blocking Protection (Security Gate)
  if (!session) {
    return <Redirect href="/" />;
  }

  let title = "Ana Sayfa";
  let isMainPage = true;
  let breadcrumbItems: { label: string; href?: string }[] = [];

  if (pathname === '/visitors') {
    title = "Ziyaretçiler";
  } else if (pathname === '/appointments') {
    title = "Randevular";
  } else if (pathname === '/blacklist') {
    title = "Kara Liste";
  } else if (pathname === '/settings') {
    title = "Kontrol Paneli / Ayarlar";
  } else if (pathname === '/dashboard') {
    title = "Ana Sayfa";
  } else if (pathname === '/keygen') {
    title = "Davet Anahtarı Üret";
  } else if (pathname === '/visitors/add') {
    isMainPage = false;
    title = "Ziyaretçi Ekle";
    breadcrumbItems = [
      { label: 'Ziyaretçiler', href: '/visitors' },
      { label: 'Ziyaretçi Ekle' }
    ];
  } else {
    // If it's none of the main sidebar links, it means it's a subpage (like add visitor)
    isMainPage = false;
    title = "Detaylar"; // A default for subpages unless handled otherwise
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
