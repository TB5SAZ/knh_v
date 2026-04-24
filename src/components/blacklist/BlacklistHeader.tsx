import React from 'react';
import { View, Text, useWindowDimensions, Platform, Pressable, Modal } from 'react-native';
import { Button, ButtonText, ButtonIcon } from '@/src/components/ui/button';
import { VStack } from '@/src/components/ui/vstack';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react-native';
import { AppInput } from '../core/AppInput';
import { AppButton } from '../core/AppButton';
import { AppSelect } from '../core/AppSelect';

export interface BlacklistHeaderProps {
  onAddPress?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  departments?: {label: string, value: string}[];
  profiles?: {label: string, value: string, department_id: string}[];
  selectedDepartment?: string;
  onDepartmentChange?: (val: string) => void;
  selectedPersonnel?: string;
  onPersonnelChange?: (val: string) => void;
  onClearFilters?: () => void;
  selectedSort?: string;
  onSortChange?: (val: string) => void;
  canAdd?: boolean;
}

export function BlacklistHeader({ 
  onAddPress, 
  searchQuery, 
  onSearchChange,
  departments = [],
  profiles = [],
  selectedDepartment = '',
  onDepartmentChange,
  selectedPersonnel = '',
  onPersonnelChange,
  onClearFilters,
  selectedSort = 'date_desc',
  onSortChange,
  canAdd = true
}: BlacklistHeaderProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isCompact = width < 1280;
  const [showFilters, setShowFilters] = React.useState(false);

  // Generate options
  const departmentOptions = [
    { label: 'Tüm Birimler', value: '' },
    ...departments
  ];

  const filteredProfiles = selectedDepartment 
    ? profiles.filter(p => p.department_id === selectedDepartment)
    : profiles;

  const personnelOptions = [
    { label: 'Tüm Kişiler', value: '' },
    ...filteredProfiles.map(p => ({ label: p.label, value: p.value }))
  ];

  const filterContent = (
    <View className="w-full gap-4">
      <View className="w-full" style={{ zIndex: 10 }}>
        <Text className="text-[#6e6f78] text-[11px] mb-1 font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Birim</Text>
        <AppSelect 
          options={departmentOptions}
          selectedValue={selectedDepartment}
          onValueChange={onDepartmentChange || (() => {})}
        />
      </View>
      <View className="w-full" style={{ zIndex: 5 }}>
        <Text className="text-[#6e6f78] text-[11px] mb-1 font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Kişi</Text>
        <AppSelect 
          options={personnelOptions}
          selectedValue={selectedPersonnel}
          onValueChange={onPersonnelChange || (() => {})}
          isDisabled={!selectedDepartment}
        />
      </View>
      <AppButton 
        title="Filtreleri Temizle"
        variant="secondary"
        size="md"
        onPress={() => {
          if (onClearFilters) onClearFilters();
          setShowFilters(false);
        }} 
        className="w-full"
      />
    </View>
  );

  const filterButtonRef = React.useRef<any>(null);
  const dropdownRef = React.useRef<any>(null);
  const [filterPos, setFilterPos] = React.useState({ top: 180, left: 20 });

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !showFilters || isMobile) return;

    function handleDocClick(e: MouseEvent) {
      const dropdownEl = (dropdownRef.current as any);
      const btnEl = (filterButtonRef.current as any);
      if (dropdownEl && typeof dropdownEl.contains === 'function' && dropdownEl.contains(e.target)) return;
      if (btnEl && typeof btnEl.contains === 'function' && btnEl.contains(e.target)) return;
      
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
  }, [showFilters, isMobile]);

  const handleFilterPress = () => {
    if (!showFilters && filterButtonRef.current) {
      filterButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setFilterPos({
          top: y + height + 8,
          left: Math.max(10, x + width - 260) 
        });
        setShowFilters(true);
      });
    } else {
      setShowFilters(false);
    }
  };

  return (
    <View className="bg-white rounded-[16px] px-[16px] lg:px-[20px] py-[16px] flex-col w-full">
      <View className="flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
      {/* Left Section: Search & Filter (And Add Button on Mobile) */}
      <View className={`flex-row items-center gap-[10px] relative z-50 ${isMobile ? 'w-full' : ''}`}>
        <View className={isMobile ? 'flex-1' : 'w-[180px] lg:w-[223px]'}>
          <AppInput 
            leftIcon={Search} 
            placeholder="Kişi ara"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Filter Button & Dropdown Wrapper */}
        <View className="relative z-50">
          <Button 
            ref={filterButtonRef}
            onPress={() => setShowFilters(!showFilters)} 
            variant="outline" 
            className={`bg-[#e4f2d3] border-0 flex-row items-center justify-center ${showFilters ? 'opacity-80' : ''} ${
              isMobile 
                ? 'rounded-[10px] w-[40px] h-[36px] p-0' 
                : (isCompact ? 'rounded-lg w-[36px] h-[36px] p-0' : 'rounded-lg px-3 py-2 h-[36px]')
            }`}
          >
            <ButtonIcon as={Filter} className={`${isMobile || isCompact ? '' : 'mr-1'} text-typography-900`} />
            {(!isMobile && !isCompact) && (
              <>
                <ButtonText className="text-typography-900 text-xs font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Filtre</ButtonText>
                <ButtonIcon as={ChevronDown} className="ml-1 text-typography-900" />
              </>
            )}
          </Button>

          {/* Desktop Filter Dropdown */}
          {showFilters && !isMobile && (
            <View 
              ref={dropdownRef}
              className="absolute top-[44px] right-0 bg-white rounded-xl shadow-lg border border-[#e4f2d3] p-4 w-[260px] gap-4"
              style={{ zIndex: 100, elevation: 10 }}
            >
              {filterContent}
            </View>
          )}
        </View>

        {/* Add Button for Mobile */}
        {isMobile && canAdd && (
          <Button onPress={onAddPress} className="bg-[#e63d4b] border-0 rounded-[10px] w-[40px] h-[36px] p-0 flex items-center justify-center">
            <ButtonIcon as={Plus} className="text-white" />
          </Button>
        )}
      </View>

      {/* Right Section: Sort & Add Button (Desktop Only) */}
      {!isMobile && (
        <View className="flex-row items-center gap-[10px]">
          {/* Sort */}
          <View className="flex-row items-baseline gap-[10px]">
            <Text 
              className="font-normal text-[#6e6f78] text-[11px] leading-[1.24] hidden lg:flex"
              style={{ fontFamily: 'DMSans_400Regular' }}
            >
              Sırala:
            </Text>
            <View className="w-[140px] lg:w-[180px]">
              <AppSelect 
                options={[
                  { label: 'Tarih (Önce En Yeni)', value: 'date_desc' },
                  { label: 'Tarih (Önce En Eski)', value: 'date_asc' },
                  { label: 'Alfabetik (A-Z)', value: 'name_asc' },
                  { label: 'Alfabetik (Z-A)', value: 'name_desc' }
                ]}
                selectedValue={selectedSort}
                onValueChange={onSortChange || (() => {})}
                className="bg-[#e4f2d3] h-[34px] min-h-[34px] px-[12px] border-0"
              />
            </View>
          </View>
          
          {canAdd && (
            <AppButton 
              title="Kara Listeye Ekle"
              variant="error"
              size="md"
              className="bg-[#e63d4b] border-0"
              onPress={onAddPress}
            />
          )}
        </View>
      )}
      </View>

      {/* Mobile inline filter panel */}
      {showFilters && isMobile && (
        <View className="w-full bg-white rounded-xl border border-[#e4f2d3] p-4 mt-4">
          {filterContent}
        </View>
      )}
    </View>
  );
}
