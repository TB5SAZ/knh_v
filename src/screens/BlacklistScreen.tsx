import React, { useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions, Alert, Platform } from 'react-native';
import { Spinner } from '../components/ui/spinner';
import { BlacklistCard } from '../components/BlacklistCard';
import { BlacklistHeader } from '../components/blacklist/BlacklistHeader';
import { AppPagination } from '../components/core/AppPagination';
import { AppSelect } from '../components/core/AppSelect';
import { AddBlacklistModal } from '../components/blacklist/AddBlacklistModal';
import { AppAlert } from '../components/core/AppAlert';
import { useAuth } from '../providers/AuthProvider';
import { TARGET_DEPARTMENTS } from '../constants/departments';
import { useBlacklistData } from '../hooks/blacklist/useBlacklistData';

export function BlacklistScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const { profile } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    blacklistData,
    isLoading,
    totalCount,
    searchQuery,
    handleSearchChange,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    selectedDepartment,
    setSelectedDepartment,
    selectedPersonnel,
    setSelectedPersonnel,
    selectedSort,
    setSelectedSort,
    departments,
    profiles,
    fetchBlacklist,
    deleteBlacklistItem
  } = useBlacklistData(profile);

  // Sidebar width logic for container calculation
  const sidebarWidth = isMobile ? 0 : (windowWidth >= 1024 ? 245 : 60);
  const calculatedContainerWidth = Math.max(windowWidth - sidebarWidth - 60, 270);
  const gap = 20;
  
  let numCols = 4;
  if (isMobile) {
    numCols = 1;
  } else if (windowWidth < 1280) {
    numCols = 2;
  }
  
  const cardWidth = Math.floor((calculatedContainerWidth - (numCols - 1) * gap) / numCols);

  const basePageSize = 12;
  const pageSizeOptions = [
    { label: String(basePageSize), value: String(basePageSize) },
    { label: String(basePageSize * 2), value: String(basePageSize * 2) },
    { label: String(basePageSize * 4), value: String(basePageSize * 4) }
  ];

  const totalCards = blacklistData.length;
  const fillersNeeded = totalCards === 0 ? 0 : (numCols - (totalCards % numCols)) % numCols;
  const fillerArray = Array.from({ length: fillersNeeded }).map((_, i) => i);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogVisible(true);
  };

  const proceedDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteDialogVisible(false);
      await deleteBlacklistItem(itemToDelete);
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(`Hata: ${err.message || 'Kayıt silinirken bir hata oluştu.'}`);
      } else {
        Alert.alert("Hata", err.message || "Kayıt silinirken bir hata oluştu.");
      }
    } finally {
      setItemToDelete(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <View className="flex-1 bg-[#f7f7f7]">
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 20, paddingBottom: 40, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View className="z-50" style={{ zIndex: 50, elevation: 5 }}>
          <BlacklistHeader 
            canAdd={profile?.department_id !== TARGET_DEPARTMENTS.SECURITY_DEPT_ID}
            onAddPress={() => setIsAddModalOpen(true)} 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            departments={departments}
            profiles={profiles}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={(val) => {
              setSelectedDepartment(val);
              setSelectedPersonnel('');
              setCurrentPage(1);
            }}
            selectedPersonnel={selectedPersonnel}
            onPersonnelChange={(val) => {
              setSelectedPersonnel(val);
              setCurrentPage(1);
            }}
            onClearFilters={() => {
              setSelectedDepartment('');
              setSelectedPersonnel('');
              setCurrentPage(1);
            }}
            selectedSort={selectedSort}
            onSortChange={(val) => {
              setSelectedSort(val);
              setCurrentPage(1);
            }}
          />
        </View>

        {isLoading && blacklistData.length === 0 ? (
          <View className="w-full py-20 items-center justify-center">
            <Spinner size="large" color="#4caf50" />
            <Text className="mt-4 text-[#6e6f78] text-[14px]" style={{ fontFamily: 'DMSans_500Medium' }}>Yükleniyor...</Text>
          </View>
        ) : blacklistData.length === 0 ? (
          <View className="w-full py-20 items-center justify-center">
            <Text className="text-[#6e6f78] text-[16px]" style={{ fontFamily: 'DMSans_500Medium' }}>
              Kara listede kayıt bulunamadı.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-[20px] w-full mt-[16px]">
            {blacklistData.map((item) => (
              <BlacklistCard key={item.id} data={item} cardWidth={cardWidth} onDelete={handleDelete} />
            ))}
            {fillerArray.map((key) => (
              <View 
                key={`filler-${key}`} 
                style={{ 
                  width: cardWidth, 
                  flexGrow: 1,
                  flexShrink: 0
                }} 
              />
            ))}
          </View>
        )}

        <View 
          className={`bg-white rounded-[16px] px-[16px] lg:px-[20px] py-[12px] lg:py-[16px] justify-between w-full mt-[16px] gap-4 ${
            isMobile ? 'flex-col items-center' : 'flex-row items-center'
          }`}
        >
          <View className="flex-row items-center gap-[6px] lg:gap-[8px]">
            <Text className="font-normal text-[#757575] text-[12px] lg:text-[14px] leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>
              {totalCount} kayıttan
            </Text>
            
            <View className="w-[55px] lg:w-[60px]">
              <AppSelect 
                options={pageSizeOptions}
                selectedValue={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                className="bg-white h-[26px] min-h-[26px] lg:h-[28px] lg:min-h-[28px] px-[4px] lg:px-[6px] border-0"
              />
            </View>

            <Text className="font-normal text-[#757575] text-[12px] lg:text-[14px] leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>
              tanesi görüntüleniyor.
            </Text>
          </View>
          
          <AppPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            size={windowWidth < 1024 ? 'sm' : 'md'}
          />
        </View>

      </ScrollView>

      <AddBlacklistModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          fetchBlacklist();
        }}
      />

      <AppAlert 
        isOpen={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        title="Kayıt Sil"
        description="Bu kişiyi kara listeden çıkarmak istediğinize emin misiniz? Bu işlem geri alınamaz."
        status="error"
        confirmText="Sil"
        onConfirm={proceedDelete}
      />
    </View>
  );
}
