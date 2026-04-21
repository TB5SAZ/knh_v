import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { VisitorData } from '../../types/visitor';
import { mapVisitorData, buildBaseQuery, applyFiltersAndSort } from '../../utils/visitorUtils';
import { supabase } from '../../lib/supabase';

interface UseVisitorTableDataProps {
  searchQuery?: string;
  currentPage?: number;
  itemsPerPage?: number;
  sortOption?: string;
  departmentId?: string;
  hostId?: string;
  onTotalCountChange?: (count: number) => void;
}

export const useVisitorTableData = ({
  searchQuery = '',
  currentPage = 1,
  itemsPerPage = 10,
  sortOption = 'entry_time-desc',
  departmentId = '',
  hostId = '',
  onTotalCountChange
}: UseVisitorTableDataProps) => {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { user, profile } = useAuth();

  useEffect(() => {
    let isSubscribed = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchVisitors = async () => {
      try {
        setIsLoading(true);
        const safeQuery = searchQuery.trim().replace(/[%",]/g, '');
        
        let { builder: query } = await buildBaseQuery(safeQuery);
        
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        query = applyFiltersAndSort(query, {
          profile, user, departmentId, hostId, sortOption, from, to
        });
        
        console.log('[DEBUG] Executing visit query...');
        const { data, error, count } = await query;
        console.log('[DEBUG] Visit query result:', { dataSize: data?.length, error, count });
        
        if (!isSubscribed) return;
        
        if (error) {
          console.error('Error fetching visitors:', error);
          return;
        }

        if (data) {
          const mapped = data.map(mapVisitorData);
          console.log('[DEBUG] Mapped visitors size:', mapped.length);
          setVisitors(mapped);
          if (count !== null) {
            setTotalCount(count);
            onTotalCountChange?.(count);
          }
        }
      } catch (err) {
        if (!isSubscribed) return;
        console.error('Unexpected error fetching visitors:', err);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    timeoutId = setTimeout(() => {
      fetchVisitors();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentPage, itemsPerPage, sortOption, departmentId, hostId, profile?.department_id, user?.id, refreshTrigger]);

  useEffect(() => {
    // Supabase Realtime Subscription for 'visits' table
    const channel = supabase.channel('visits-all-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visits' },
        (payload) => {
          console.log('[Realtime] visit table change detected:', payload.eventType);
          setRefreshTrigger(prev => prev + 1); // trigger a re-fetch
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  return {
    visitors,
    isLoading,
    totalCount,
    activeRowId,
    setActiveRowId,
    refresh
  };
};
