import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, useWindowDimensions, Alert, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui/spinner';
import { BlacklistCard, BlacklistData } from '../components/BlacklistCard';
import { BlacklistHeader } from '../components/blacklist/BlacklistHeader';
import { AppPagination } from '../components/core/AppPagination';
import { AppSelect } from '../components/core/AppSelect';
import { AddBlacklistModal } from '../components/blacklist/AddBlacklistModal';
import { AppAlert } from '../components/core/AppAlert';
import { useAuth } from '../providers/AuthProvider';
import { TARGET_DEPARTMENTS } from '../constants/departments';

export function BlacklistScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Supabase states
  const [blacklistData, setBlacklistData] = useState<BlacklistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(12);
  
  // Dynamic Maps (refs to avoid fetchBlacklist re-creation on map update)
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [personnelMap, setPersonnelMap] = useState<Record<string, string>>({});
  const [profileRolesMap, setProfileRolesMap] = useState<Record<string, string>>({});
  const personnelMapRef = useRef(personnelMap);
  const profileRolesMapRef = useRef(profileRolesMap);
  const profileRef = useRef(profile);
  useEffect(() => { personnelMapRef.current = personnelMap; }, [personnelMap]);
  useEffect(() => { profileRolesMapRef.current = profileRolesMap; }, [profileRolesMap]);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [selectedSort, setSelectedSort] = useState('date_desc');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  
  // Dropdown Options
  const [departments, setDepartments] = useState<{label: string, value: string}[]>([]);
  const [profiles, setProfiles] = useState<{label: string, value: string, department_id: string}[]>([]);

  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    async function fetchMaps() {
      try {
        console.log('[DEBUG-BLACKLIST] Fetching maps...');
        const depRes = await supabase.from('departments').select('id, name').eq('is_selectable', true).order('name');
        const profRes = await supabase.from('profiles').select('id, first_name, last_name, department_id, role');

        if (depRes.data) {
        const dMap: Record<string, string> = {};
        depRes.data.forEach(d => { dMap[d.id] = d.name; });
        setDepartmentMap(dMap);
        setDepartments(depRes.data.map(d => ({ label: d.name, value: d.id })));
      }
      
      if (profRes.data) {
        const pMap: Record<string, string> = {};
        const pRolesMap: Record<string, string> = {};
        profRes.data.forEach(p => { 
          pMap[p.id] = `${p.first_name} ${p.last_name}`; 
          pRolesMap[p.id] = p.role || 'Bilinmiyor';
        });
        setPersonnelMap(pMap);
        setProfileRolesMap(pRolesMap);
        setProfiles(profRes.data.map(p => ({ 
          label: `${p.first_name} ${p.last_name}${p.role ? ` / ${p.role}` : ''}`, 
          value: p.id,
          department_id: p.department_id || '' 
        })));
        }
        console.log('[DEBUG-BLACKLIST] Maps fetched successfully.');
      } catch (err) {
        console.error('[DEBUG-BLACKLIST] Error fetching maps:', err);
      } finally {
        setMapsLoaded(true);
      }
    }
    fetchMaps();
  }, []);

  // Sidebar width logic for container calculation
  const sidebarWidth = isMobile ? 0 : (windowWidth >= 1024 ? 245 : 60);
  // Padding Left 24 + Padding Right 20 = 44. Safe scrollbar margin = 16. Total 60.
  const calculatedContainerWidth = Math.max(windowWidth - sidebarWidth - 60, 270);

  const gap = 20;
  
  // Sütun sayısını ekran boyutuna göre sabitle (Kullanıcı İsteği: Desktop 4, Tablet 2, Mobil 1)
  let numCols = 4;
  if (isMobile) {
    numCols = 1;
  } else if (windowWidth < 1280) { // Tablet (1280px altı)
    numCols = 2;
  }
  
  const cardWidth = Math.floor((calculatedContainerWidth - (numCols - 1) * gap) / numCols);

  // Remove automatic page size update on resize to prevent infinite render loops caused by scrollbars appearing/disappearing
  const basePageSize = 12; // Static base page size

  // Generate options based on basePageSize (12, 24, 48)
  const pageSizeOptions = [
    { label: String(basePageSize), value: String(basePageSize) },
    { label: String(basePageSize * 2), value: String(basePageSize * 2) },
    { label: String(basePageSize * 4), value: String(basePageSize * 4) }
  ];

  // Calculate filler views needed for the last row
  const totalCards = blacklistData.length;
  const fillersNeeded = totalCards === 0 ? 0 : (numCols - (totalCards % numCols)) % numCols;
  const fillerArray = Array.from({ length: fillersNeeded }).map((_, i) => i);

  const fetchBlacklist = useCallback(async () => {
    if (!mapsLoaded) return;
    try {
      console.log('[DEBUG-BLACKLIST] Starting fetchBlacklist...');
      setIsLoading(true);
      
      let query = supabase
        .from('blacklist_view')
        .select('*', { count: 'exact' });

      // Apply Role-Based Viewing Permissions
      const currentProfile = profileRef.current;
      const isAdmin = currentProfile?.role === 'admin' || currentProfile?.department_id === TARGET_DEPARTMENTS.ADMIN_DEPT_ID;
      const isSecurity = currentProfile?.department_id === TARGET_DEPARTMENTS.SECURITY_DEPT_ID;
      const isSecretary = currentProfile?.department_id === TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID;
      
      if (!isAdmin && !isSecurity) {
        if (isSecretary) {
          // Secretary can only view Blacklist entries made by 'Başhekimlik'
          query = query.eq('department', TARGET_DEPARTMENTS.RESTRICTED_VIEW_DEPT_ID);
        } else if (currentProfile?.id) {
          // Other personnel can only view their own Blacklist entries
          query = query.eq('personnel', currentProfile.id);
        }
      }
        
      if (debouncedSearchQuery && debouncedSearchQuery.trim().length > 0) {
        query = query.or(`first_name.ilike.%${debouncedSearchQuery}%,last_name.ilike.%${debouncedSearchQuery}%,tc_no.ilike.%${debouncedSearchQuery}%`);
      }

      if (selectedDepartment) {
        query = query.eq('department', selectedDepartment);
      }
      
      if (selectedPersonnel) {
        query = query.eq('personnel', selectedPersonnel);
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Apply Sorting
      if (selectedSort === 'date_desc') {
        query = query.order('created_at', { ascending: false });
      } else if (selectedSort === 'date_asc') {
        query = query.order('created_at', { ascending: true });
      } else if (selectedSort === 'name_asc') {
        query = query.order('first_name', { ascending: true }).order('last_name', { ascending: true });
      } else if (selectedSort === 'name_desc') {
        query = query.order('first_name', { ascending: false }).order('last_name', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      console.log('[DEBUG-BLACKLIST] Executing query range:', { from, to });
      const { data, count, error } = await query.range(from, to);
      console.log('[DEBUG-BLACKLIST] Query returned:', { dataLength: data?.length, count, error });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const pMap = personnelMapRef.current;
        const prMap = profileRolesMapRef.current;
        const mappedData: BlacklistData[] = data.map((item: any) => ({
          id: item.id || Math.random().toString(),
          tcNo: item.tc_no,
          name: `${item.first_name} ${item.last_name ? item.last_name.toUpperCase() : ''}`.trim(),
          blockerName: pMap[item.personnel] || item.personnel || 'Bilinmiyor',
          blockerTitle: prMap[item.personnel] || 'Bilinmiyor',
          reason: item.reason,
          personnelId: item.personnel
        }));
        setBlacklistData(mappedData);
      }
      if (count !== null) {
        setTotalCount(count);
      }
    } catch (err) {
      console.error('Error fetching blacklist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mapsLoaded, currentPage, debouncedSearchQuery, selectedDepartment, selectedPersonnel, selectedSort, pageSize]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  // If search changes, reset page to 1
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogVisible(true);
  };

  const proceedDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteDialogVisible(false);
      setIsLoading(true);
      const { data, error } = await supabase.from('blacklist').delete().eq('id', itemToDelete).select();
      
      console.log('Delete operation result:', { data, error, itemToDelete });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Kayıt silinemedi. Lütfen Supabase RLS (Row Level Security) kurallarında DELETE izni olduğundan emin olun.');
      }
      
      fetchBlacklist();
    } catch (err: any) {
      console.error('Error deleting blacklist item:', err);
      if (Platform.OS === 'web') {
        window.alert(`Hata: ${err.message || 'Kayıt silinirken bir hata oluştu.'}`);
      } else {
        Alert.alert("Hata", err.message || "Kayıt silinirken bir hata oluştu.");
      }
      setIsLoading(false);
    } finally {
      setItemToDelete(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  console.log('[DEBUG-RENDER] BlacklistScreen rendering. isLoading:', isLoading, 'blacklistData.length:', blacklistData.length);
  return (
    <View className="flex-1 bg-[#f7f7f7]">
      {/* Main Content Area */}
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 20, paddingBottom: 40, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* Header / Action Bar */}
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

        {/* Cards Grid or Loading */}
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
          <View 
            className="flex-row flex-wrap gap-[20px] w-full mt-[16px]"
          >
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

        {/* Pagination Section */}
        <View 
          className={`bg-white rounded-[16px] px-[16px] lg:px-[20px] py-[12px] lg:py-[16px] justify-between w-full mt-[16px] gap-4 ${
            isMobile ? 'flex-col items-center' : 'flex-row items-center'
          }`}
        >
          {/* Left Text & Page Size Selector */}
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

      {/* Add Blacklist Modal */}
      <AddBlacklistModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          fetchBlacklist();
        }}
      />

      {/* Delete Alert Dialog */}
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
