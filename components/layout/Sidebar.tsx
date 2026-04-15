import React from 'react';
import { View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { AppNavButton } from '@/components/ui/AppNavButton';
import { Pressable } from '@/components/ui/pressable';
import { Image } from 'expo-image';
import { 
  Home, 
  User, 
  CalendarDays, 
  ShieldOff, 
  Settings, 
  LogOut
} from 'lucide-react-native';
import { Link, usePathname } from 'expo-router';
import { authService } from '@/src/services/authService';
import { useAuth } from '@/src/providers/AuthProvider';

export interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View 
      className={`bg-white h-full relative py-5 flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-[60px] px-1.5 items-center' : 'w-[245px] px-4'
      }`}
    >
      <View className="w-full">
        {/* Header - Logo and Titles */}
        <HStack className={`items-center mb-8 h-12 w-full ${isCollapsed ? 'justify-center' : 'gap-[10px]'}`}>
          <View className="h-12 w-12 items-center justify-center shrink-0">
            <Image 
              source={require('@/assets/logos/logo_app_icon.svg')} 
              style={{ width: 40, height: 40 }} 
              contentFit="contain" 
            />
          </View>
          
          {!isCollapsed && (
            <View className="justify-center flex-1 h-[42px] mt-0.5">
              <Image 
                source={require('@/assets/logos/hst_logo_text.svg')} 
                style={{ width: '100%', height: '100%' }} 
                contentFit="contain" 
                contentPosition="left center"
              />
            </View>
          )}
        </HStack>

        {/* Navigation Section */}
        <VStack space="sm" className={`w-full ${isCollapsed ? 'items-center gap-3' : 'gap-2'}`}>
          <Link href="/dashboard" asChild>
            <AppNavButton 
              label="Ana Sayfa" 
              icon={Home} 
              isActive={pathname === '/dashboard'} 
              isCollapsed={isCollapsed} 
            />
          </Link>
          <Link href="/visitors" asChild>
            <AppNavButton 
              label="Ziyaretçiler" 
              icon={User} 
              isActive={pathname === '/visitors'} 
              isCollapsed={isCollapsed} 
            />
          </Link>
          <Link href="/appointments" asChild>
            <AppNavButton 
              label="Randevular" 
              icon={CalendarDays} 
              isActive={pathname === '/appointments'}
              isCollapsed={isCollapsed} 
            />
          </Link>
          <Link href="/blacklist" asChild>
            <AppNavButton 
              label="Kara Liste" 
              icon={ShieldOff} 
              isActive={pathname === '/blacklist'}
              isCollapsed={isCollapsed} 
            />
          </Link>
          {role === 'Sistem Yöneticisi' && (
            <Link href="/settings" asChild>
              <AppNavButton 
                label="Kontrol Paneli" 
                icon={Settings} 
                isActive={pathname === '/settings'}
                isCollapsed={isCollapsed} 
              />
            </Link>
          )}
        </VStack>
      </View>

      {/* Footer Section */}
      <View className="w-full">
        {isCollapsed ? (
          <Pressable onPress={handleLogout} className="h-10 w-10 bg-brand-light rounded-xl items-center justify-center active:opacity-70 mx-auto transition-colors md:hover:bg-[#d0ebb3]">
            <LogOut size={18} color="var(--brand-dark)" />
          </Pressable>
        ) : (
          <Pressable onPress={handleLogout} className="w-full flex-row items-center justify-center gap-2 bg-brand-light py-3 px-4 rounded-xl active:opacity-70 transition-colors md:hover:bg-[#d0ebb3]">
             <LogOut size={18} color="var(--brand-dark)" />
             <Text className="text-brand-dark font-medium text-[14px] tracking-tight">Çıkış Yap</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
