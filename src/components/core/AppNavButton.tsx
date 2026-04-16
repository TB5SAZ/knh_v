import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { Pressable } from '@/src/components/ui/pressable';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { CustomBadge } from './CustomBadge';
import { LucideIcon, ChevronDown } from 'lucide-react-native';

export interface AppNavButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable> {
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  badgeCount?: number;
  hasChevron?: boolean;
  isCollapsed?: boolean;
}

export const AppNavButton = forwardRef<React.ElementRef<typeof Pressable>, AppNavButtonProps>(
  ({ 
    label, 
    icon: Icon, 
    isActive = false, 
    badgeCount, 
    hasChevron = false, 
    isCollapsed = false, 
    className = '', 
    ...props 
  }, ref) => {
    
    const containerClasses = [
      'group flex-row items-center rounded-xl transition-all duration-200',
      isCollapsed ? 'justify-center w-12 h-12 p-0' : 'justify-between px-4 py-3 w-full',
      isActive ? 'bg-brand-primary' : 'bg-transparent active:bg-brand-light md:hover:bg-brand-light',
      className
    ].filter(Boolean).join(' ');

    const iconColor = isActive ? 'text-white' : 'text-slate-700';
    const textColor = isActive ? 'text-white' : 'text-slate-700';
    const chevronColor = isActive ? 'text-white' : 'text-slate-500';

    return (
      <Pressable ref={ref} className={containerClasses} {...props}>
        <HStack className={`items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <View className="relative">
            <Icon size={20} className={iconColor} />
            
            {/* Collapsed dot badge */}
            {isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
              <View className="absolute -top-1 -right-1 z-10 w-2.5 h-2.5 bg-[#0e4d41] rounded-full border border-white" />
            )}
          </View>
          
          {!isCollapsed && (
            <Text className={`font-medium text-[14px] ${textColor}`}>
              {label}
            </Text>
          )}
        </HStack>

        {!isCollapsed && (badgeCount !== undefined || hasChevron) && (
          <HStack className="items-center gap-2">
             {badgeCount !== undefined && badgeCount > 0 && (
               <CustomBadge 
                 count={badgeCount} 
                 size="md" 
                 className={isActive ? 'bg-[#0e4d41] border-0' : 'bg-brand-primary border-0'} 
               />
             )}
             {hasChevron && (
               <ChevronDown size={18} className={chevronColor} />
             )}
          </HStack>
        )}
      </Pressable>
    );
  }
);

AppNavButton.displayName = 'AppNavButton';
