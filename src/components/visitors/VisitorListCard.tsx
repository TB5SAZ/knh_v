import React, { useState } from 'react';
import { View, Text, useWindowDimensions, Platform, Pressable } from 'react-native';
import { VStack } from '@/src/components/ui/vstack';
import { HStack } from '@/src/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/src/components/ui/button';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react-native';
import { AppInput } from '@/src/components/core/AppInput';
import { AppSelect } from '@/src/components/core/AppSelect';
import { AppPagination } from '@/src/components/core/AppPagination';
import VisitorTable from './VisitorTable';
import { fetchSelectableDepartments } from '@/src/services/departmentService';
import { fetchProfilesByDepartment } from '@/src/services/profileService';

interface VisitorListCardProps {
  onAddVisitor?: () => void;
}

export function VisitorListCard({ onAddVisitor }: VisitorListCardProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOption, setSortOption] = useState('entry_time-desc');
  
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState<{label: string, value: string}[]>([]);
  const [profiles, setProfiles] = useState<{label: string, value: string}[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');

  const { width } = useWindowDimensions();
  const isCompact = width < 1280;
  const isMobile = width < 768;

  // Sadece component mount edildiğinde departmanları çek
  React.useEffect(() => {
    fetchSelectableDepartments().then((data) => {
      setDepartments([{ label: 'Tüm Birimler', value: '' }, ...data.map(d => ({ label: d.name, value: d.id }))]);
    });
  }, []);

  // Departman değiştiğinde kişileri (profilleri) getir
  React.useEffect(() => {
    if (selectedDepartment) {
      fetchProfilesByDepartment(selectedDepartment).then((data) => {
        setProfiles([{ label: 'Tüm Kişiler', value: '' }, ...data.map(p => ({ label: `${p.first_name} ${p.last_name}`, value: p.id }))]);
      });
      setSelectedProfile(''); // Departman değişirse kişiyi sıfırla
    } else {
      setProfiles([]);
      setSelectedProfile('');
    }
  }, [selectedDepartment]);

  return (
    <VStack className="bg-white rounded-2xl p-4 md:p-6 gap-4 w-full shrink">
      {/* Header Section */}
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
            <Button onPress={() => setShowFilters(!showFilters)} variant="outline" className={`bg-[#e4f2d3] border-0 rounded-lg flex-row items-center justify-center ${isCompact ? 'w-[36px] h-[36px] p-0' : 'px-3 py-2 h-[36px]'} ${showFilters ? 'opacity-80' : ''}`}>
              <ButtonIcon as={Filter} className={`${isCompact ? '' : 'mr-1'} text-typography-900`} />
              {!isCompact && (
                <>
                  <ButtonText className="text-typography-900 text-xs font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Filtre</ButtonText>
                  <ButtonIcon as={ChevronDown} className="ml-1 text-typography-900" />
                </>
              )}
            </Button>
            {/* Dropdown Filters */}
            {showFilters && (
              <>
                {Platform.OS === 'web' ? (
                  <View 
                    onTouchStart={() => setShowFilters(false)}
                    onPointerDown={() => setShowFilters(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90, cursor: 'default' } as any}
                  />
                ) : (
                  <Pressable 
                    onPress={() => setShowFilters(false)}
                    style={{ position: 'absolute', top: -2000, left: -2000, right: -2000, bottom: -2000, zIndex: 90 }}
                  />
                )}
                <VStack className="absolute top-[120%] right-0 sm:left-0 md:left-auto md:right-0 bg-white rounded-xl shadow-lg border border-[#e4f2d3] p-4 w-[260px] z-[99] gap-4">
                <View className="w-full">
                  <Text className="text-[#6e6f78] text-[11px] mb-1 font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>Birim</Text>
                  <AppSelect 
                    options={departments.length > 0 ? departments : [{ label: 'Tüm Birimler', value: '' }]}
                    selectedValue={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  />
                </View>
                <View className="w-full">
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
              </>
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



      {/* Table Integration */}
      <View className="w-full overflow-hidden shrink mt-1 md:mt-2">
        <VisitorTable 
          searchQuery={searchQuery}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          sortOption={sortOption}
          departmentId={selectedDepartment}
          hostId={selectedProfile}
          onTotalCountChange={setTotalCount}
        />
      </View>

      {/* Footer / Pagination Section */}
      <View className={`flex flex-row flex-wrap md:flex-nowrap items-center w-full mt-2 gap-4 md:gap-8 ${isMobile ? 'justify-center' : 'justify-between'}`}>
        {/* Pagination Info */}
        {!isMobile && (
          <HStack className="flex-1 items-center gap-2 flex-wrap min-w-[250px]">
            <Text className="text-[#757575] text-sm font-normal" style={{ fontFamily: 'DMSans_400Regular' }}>
              {totalCount} kayıttan
            </Text>
            <View className="w-[80px]">
              <AppSelect
                  options={[
                    { label: '10', value: '10' },
                    { label: '20', value: '20' },
                    { label: '50', value: '50' },
                    { label: '100', value: '100' },
                  ]}
                  selectedValue={itemsPerPage.toString()}
                  onValueChange={(val) => {
                    setItemsPerPage(Number(val));
                    setCurrentPage(1);
                  }}
              />
            </View>
            <Text className="text-[#757575] text-sm font-normal" style={{ fontFamily: 'DMSans_400Regular' }}>
              tanesi görüntüleniyor.
            </Text>
          </HStack>
        )}

        {/* Legend Indicator */}
        {!isCompact && (
          <HStack className="items-center gap-1.5 shrink-0 px-2 lg:px-4">
            <View className="size-3.5 rounded-full bg-[#e4f2d3]" />
            <Text className="text-[#63716e] text-xs font-normal" style={{ fontFamily: 'DMSans_400Regular' }}>
              Kurum İçi
            </Text>
          </HStack>
        )}

        {/* Pagination Controls */}
        <View className="w-full md:w-auto max-w-full flex-row items-center justify-center">
          <AppPagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(totalCount / itemsPerPage) || 1} 
            onPageChange={(page) => setCurrentPage(page)} 
            size={isCompact ? 'sm' : 'md'}
          />
        </View>
      </View>
    </VStack>
  );
}

export default VisitorListCard;
