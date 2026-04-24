import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { VStack } from '@/src/components/ui/vstack';
import { HStack } from '@/src/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/src/components/ui/button';
import { Search, Filter, ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { AppInput } from '@/src/components/core/AppInput';
import { AppSelect } from '@/src/components/core/AppSelect';

interface VisitorListHeaderProps {
  isMobile: boolean;
  isCompact: boolean;
  filters: ReturnType<typeof import('../../../hooks/visitors/useVisitorFilters')['useVisitorFilters']>;
  departments: { label: string; value: string }[];
  profiles: { label: string; value: string }[];
  onAddVisitor?: () => void;
}

export const VisitorListHeader = ({
  isMobile,
  isCompact,
  filters,
  departments,
  profiles,
  onAddVisitor
}: VisitorListHeaderProps) => {
  const {
    searchQuery, setSearchQuery,
    showFilters, setShowFilters,
    selectedDepartment, setSelectedDepartment,
    selectedProfile, setSelectedProfile,
    sortOption, setSortOption
  } = filters;

  const dropdownRef = useRef<View>(null);
  const filterBtnRef = useRef<View>(null);

  // Web desktop: document-level click listener for outside-click detection
  useEffect(() => {
    if (Platform.OS !== 'web' || !showFilters || isMobile) return;

    function handleDocClick(e: MouseEvent) {
      const dropdownEl = (dropdownRef.current as any);
      const btnEl = (filterBtnRef.current as any);
      if (dropdownEl && typeof dropdownEl.contains === 'function' && dropdownEl.contains(e.target)) return;
      if (btnEl && typeof btnEl.contains === 'function' && btnEl.contains(e.target)) return;
      
      // Ignore clicks inside the custom AppSelect modal portal
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        if (target.closest('[id="app-select-dropdown"]') || target.closest('[id="app-select-backdrop"]')) {
          return;
        }
      }

      setShowFilters(false);
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleDocClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleDocClick);
    };
  }, [showFilters, setShowFilters, isMobile]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters, setShowFilters]);

  // Shared filter content — used both in mobile inline panel and desktop dropdown
  const filterContent = (
    <VStack className="gap-4 w-full">
      <View className={isMobile ? 'w-full' : 'w-full'} style={{ zIndex: 10 }}>
        <Text className="text-[#6e6f78] text-[11px] mb-1 font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Birim</Text>
        <AppSelect 
          options={departments.length > 0 ? departments : [{ label: 'Tüm Birimler', value: '' }]}
          selectedValue={selectedDepartment}
          onValueChange={setSelectedDepartment}
        />
      </View>
      <View className={isMobile ? 'w-full' : 'w-full'} style={{ zIndex: 5 }}>
        <Text className="text-[#6e6f78] text-[11px] mb-1 font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Kişi</Text>
        <AppSelect 
          options={profiles.length > 0 ? profiles : [{ label: 'Tüm Kişiler', value: '' }]}
          selectedValue={selectedProfile}
          onValueChange={setSelectedProfile}
          isDisabled={!selectedDepartment}
        />
      </View>
      {(selectedDepartment || selectedProfile) && (
        <Button 
            variant="outline" 
            onPress={() => { setSelectedDepartment(''); setSelectedProfile(''); }}
            className="border-0 h-[36px] shrink-0 bg-[#fff5f5]"
        >
            <ButtonText className="text-[#eb5757] text-xs font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Temizle</ButtonText>
        </Button>
      )}
    </VStack>
  );

  return (
    <VStack className="gap-3 w-full">
      {/* Top row: title + controls */}
      <View className={`flex ${isMobile ? 'flex-col items-start' : 'flex-wrap md:flex-row items-center justify-between'} gap-4 w-full z-20`}>
        <Text className="text-typography-900 font-semibold text-[16px]" style={{ fontFamily: 'DMSans_600SemiBold' }}>
          Ziyaretçi Listesi
        </Text>

        <View className={`flex flex-row items-center gap-2.5 ${isMobile ? 'w-full' : 'flex-wrap md:flex-nowrap'}`}>
          {/* Search Input */}
          <View className={isMobile ? 'flex-1' : 'w-full md:w-[223px]'}>
            <AppInput 
              leftIcon={Search} 
              placeholder="ziyaretçi ara"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Button */}
          <View className="relative z-50">
            <View ref={filterBtnRef} collapsable={false}>
              <Button onPress={handleToggleFilters} variant="outline" className={`bg-[#e4f2d3] border-0 rounded-lg flex-row items-center justify-center ${isCompact ? 'w-[36px] h-[36px] p-0' : 'px-3 py-2 h-[36px]'} ${showFilters ? 'opacity-80' : ''}`}>
                <ButtonIcon as={Filter} className={`${isCompact ? '' : 'mr-1'} text-typography-900`} />
                {!isCompact && (
                  <>
                    <ButtonText className="text-typography-900 text-xs font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Filtre</ButtonText>
                    <ButtonIcon as={showFilters ? ChevronUp : ChevronDown} className="ml-1 text-typography-900" />
                  </>
                )}
              </Button>
            </View>

            {/* Desktop dropdown (absolute positioned) — only for non-mobile */}
            {showFilters && !isMobile && (
              <View
                ref={dropdownRef}
                collapsable={false}
                className="absolute top-[120%] right-0 sm:left-0 md:left-auto md:right-0 bg-white rounded-xl shadow-lg border border-[#e4f2d3] p-4 w-[260px] z-[99]"
              >
                {filterContent}
              </View>
            )}
          </View>

          {/* Sort By Date */}
          {!isCompact && (
            <HStack className="items-center gap-2.5">
              <Text className="text-[#6e6f78] text-[11px] font-normal leading-[1.24]" style={{ fontFamily: 'DMSans_400Regular' }}>
                Sırala:
              </Text>
              <View className="w-[170px]">
                <AppSelect
                  options={[
                    { label: 'Tarih (En Yeni)', value: 'entry_time-desc' },
                    { label: 'Tarih (En Eski)', value: 'entry_time-asc' },
                    { label: 'Ad Soyad (A-Z)', value: 'visitor_first_name-asc' },
                    { label: 'Ad Soyad (Z-A)', value: 'visitor_first_name-desc' },
                    { label: 'Konu (A-Z)', value: 'visit_purpose-asc' },
                    { label: 'Konu (Z-A)', value: 'visit_purpose-desc' }
                  ]}
                  selectedValue={sortOption}
                  onValueChange={setSortOption}
                />
              </View>
            </HStack>
          )}

          {/* Add New Button */}
          <Button onPress={onAddVisitor} className={`bg-[#35bfa3] border-0 rounded-lg flex-row items-center justify-center ${isMobile ? 'w-[36px] h-[36px] p-0' : 'px-3 py-2 h-[36px]'}`}>
            {isMobile ? (
              <ButtonIcon as={Plus} className="text-white" />
            ) : (
              <ButtonText className="text-white text-xs font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>
                Yeni Ziyaretçi Ekle
              </ButtonText>
            )}
          </Button>
        </View>
      </View>

      {/* Mobile inline filter panel — NOT absolute positioned, in normal flow */}
      {showFilters && isMobile && (
        <View className="w-full bg-white rounded-xl border border-[#e4f2d3] p-4">
          {filterContent}
        </View>
      )}
    </VStack>
  );
};
