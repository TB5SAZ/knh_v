import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { TARGET_DEPARTMENTS } from '@/src/constants/departments';
import { BlacklistData } from '@/src/components/BlacklistCard';

export function useBlacklistData(profile: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [blacklistData, setBlacklistData] = useState<BlacklistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(12);

  // Dynamic Maps

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
        const depRes = await supabase.from('departments').select('id, name').eq('is_selectable', true).order('name');
        const profRes = await supabase.from('profiles').select('id, first_name, last_name, department_id, role');

        if (depRes.data) {
          const dMap: Record<string, string> = {};
          depRes.data.forEach(d => { dMap[d.id] = d.name; });

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
      } catch (err) {
        console.error('[DEBUG-BLACKLIST] Error fetching maps:', err);
      } finally {
        setMapsLoaded(true);
      }
    }
    fetchMaps();
  }, []);

  const fetchBlacklist = useCallback(async () => {
    if (!mapsLoaded) return;
    try {
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
          query = query.eq('department', TARGET_DEPARTMENTS.RESTRICTED_VIEW_DEPT_ID);
        } else if (currentProfile?.id) {
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
      
      const { data, count, error } = await query.range(from, to);
        
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

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const deleteBlacklistItem = async (id: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.from('blacklist').delete().eq('id', id).select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Kayıt silinemedi. Lütfen Supabase RLS (Row Level Security) kurallarında DELETE izni olduğundan emin olun.');
    }
    fetchBlacklist();
  };

  return {
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
  };
}
