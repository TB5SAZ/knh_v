import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { AppBreadcrumb, AppBreadcrumbItem } from '@/components/ui/AppBreadcrumb';
import { AppIconButton } from '@/components/ui/AppIconButton';
import { CustomAvatar } from '@/components/ui/CustomAvatar';
import { CustomBadge } from '@/components/ui/CustomBadge';
import { ArrowLeft, Settings, Bell, Menu, ChevronLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/src/providers/AuthProvider';
import { useRouter } from 'expo-router';

export interface HeaderProps {
  title: string;
  isMainPage?: boolean;
  breadcrumbItems?: AppBreadcrumbItem[];
}

export function Header({ title, isMainPage = false, breadcrumbItems = [] }: HeaderProps) {
  const { user, profile, role } = useAuth();
  
  const firstName = profile?.first_name || user?.user_metadata?.first_name || 'Kullanıcı';
  const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const displayRole = role || 'Yetkili';
  const router = useRouter();

  return (
    <View className="w-full z-50">
      <View className="hidden md:flex bg-transparent flex-row justify-between items-center px-6 py-4 lg:px-8 lg:py-5">
        {/* Left Area (Title & Navigation) */}
        <View className="flex-col gap-0 lg:gap-1">
          {isMainPage ? (
            <Text className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">{title}</Text>
          ) : (
            <>
              <View className="flex-row items-center gap-2 lg:gap-3">
                <Pressable onPress={() => router.back()} className="p-1 -ml-1 rounded-full hover:bg-slate-100 active:bg-slate-200">
                  <ArrowLeft size={20} color="#1e293b" />
                </Pressable>
                <Text className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">{title}</Text>
              </View>
              {breadcrumbItems.length > 0 && (
                <AppBreadcrumb items={breadcrumbItems} />
              )}
            </>
          )}
        </View>

        {/* Right Area (Actions & Profile) */}
        <View className="flex-row items-center gap-3 lg:gap-4">
          <AppIconButton icon={Settings} variant="soft" size="xl" />
          
          <View className="relative">
            <AppIconButton icon={Bell} variant="soft" size="xl" />
            <CustomBadge 
              variant="dot" 
              size="md" 
              className="absolute top-1 right-1" 
            />
          </View>

          <View className="flex-row gap-2 lg:gap-3 items-center">
            <CustomAvatar name={fullName} size="md" />
            <View className="hidden lg:flex flex-col">
              <Text className="font-bold text-slate-800 text-sm lg:text-base tracking-tight">{fullName}</Text>
              <Text className="text-gray-500 text-[10px] lg:text-xs">{displayRole}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mobile Container */}
      <View className="flex md:hidden w-full flex-row items-center justify-between px-4 py-3 bg-white">
        {isMainPage ? (
          <>
            {/* Left: Logo */}
            <View className="w-8 h-8 items-center justify-center">
              <Image 
                source={require('../../assets/logos/logo_app_icon.svg')} 
                style={{ width: 26, height: 26 }} 
                contentFit="contain" 
              />
            </View>
            
            {/* Center: Title */}
            <Text style={{ fontFamily: 'DMSans_600SemiBold' }} className="text-[16px] text-[#203430]">
              {title}
            </Text>

            {/* Right: Menu */}
            <View className="w-8 h-8 items-center justify-center">
              <Menu size={22} color="#203430" />
            </View>
          </>
        ) : (
          <>
            {/* Left: Back Button (ChevronLeft) */}
            <Pressable onPress={() => router.back()} className="w-8 h-8 items-center justify-center -ml-1 rounded-full active:bg-slate-100">
              <ChevronLeft size={24} color="#203430" />
            </Pressable>
            
            {/* Center: Title */}
            <Text style={{ fontFamily: 'DMSans_600SemiBold' }} className="text-[16px] text-[#203430]">
              {title}
            </Text>

            {/* Right: Menu */}
            <View className="w-8 h-8 items-center justify-center">
              <Menu size={22} color="#203430" />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
