import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, useWindowDimensions } from 'react-native';
import { CustomBadge, CustomBadgeStatus } from '../ui/CustomBadge';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../ui/spinner';
import { CustomAvatar } from '../ui/CustomAvatar';
import { useAuth } from '../../providers/AuthProvider';
import { Pencil, Trash2, ShieldOff } from 'lucide-react-native';
import { Pressable as NativePressable } from 'react-native';
import { TableActionBadge } from '../core/TableActionBadge';

type VisitorStatus = CustomBadgeStatus;

interface VisitorData {
  id: string;
  visitorName: string;
  visitorTitle: string;
  hostName: string;
  hostTitle: string;
  date: string;
  time: string;
  subject: string;
  status: VisitorStatus;
  isInternal: boolean;
}


interface VisitorTableProps {
  searchQuery?: string;
  currentPage?: number;
  itemsPerPage?: number;
  sortOption?: string;
  departmentId?: string;
  hostId?: string;
  onTotalCountChange?: (count: number) => void;
}

export const VisitorTable = ({ 
  searchQuery = '',
  currentPage = 1,
  itemsPerPage = 10,
  sortOption = 'entry_time-desc',
  departmentId = '',
  hostId = '',
  onTotalCountChange
}: VisitorTableProps) => {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 1280;
  const { user, profile } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchVisitors = async () => {
      try {
        setIsLoading(true);
        const safeQuery = searchQuery.trim().replace(/[%,]/g, '');

        let query = supabase
          .from('visits')
          .select(`
            id,
            visit_purpose,
            entry_time,
            status,
            created_by,
            visitors!inner (
              first_name,
              last_name,
              title,
              tc_no,
              is_external
            ),
            profiles:profiles!visits_visited_person_id_fkey!inner (
              first_name,
              last_name,
              role,
              department_id
            )
          `, { count: 'exact' });

        if (safeQuery) {
          // Relasyonlu tablolarda tek bir OR yapamıyoruz, bu sebeple önce query'ye uyan ziyaretçileri bulup ID'lerini alıyoruz
          const { data: matchingVisitors } = await supabase
            .from('visitors')
            .select('id')
            .or(`first_name.ilike.%${safeQuery}%,last_name.ilike.%${safeQuery}%,tc_no.ilike.%${safeQuery}%`);
            
          const visitorIds = matchingVisitors?.map(v => v.id) || [];

          if (visitorIds.length > 0) {
            query = query.or(`visit_purpose.ilike.%${safeQuery}%,visitor_id.in.(${visitorIds.join(',')})`);
          } else {
            query = query.or(`visit_purpose.ilike.%${safeQuery}%`);
          }
        }

        if (profile?.department_id === '74f89e28-b11a-4824-bc7d-3f17d2e1c68a') {
          query = query.eq('profiles.department_id', '45a7d371-17c9-4560-ae01-e104ffe30610');
        } else if (departmentId) {
          query = query.eq('profiles.department_id', departmentId);
        }

        if (hostId) {
          query = query.eq('visited_person_id', hostId);
        }

        if (profile?.department_id === '4b82177d-a7ad-487e-9d3a-9181a937d99f' && user?.id) {
          query = query.eq('created_by', user.id);
        }


        // Sadece içinde bulunulan yılın kayıtlarını getir
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString();
        
        query = query.gte('entry_time', startOfYear).lte('entry_time', endOfYear);

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const [sortBy, order] = sortOption.split('-');

        const { data, error, count } = await query
          .order(sortBy as any, { ascending: order === 'asc' })
          .range(from, to);
        
        if (error) {
          console.error('Error fetching visitors:', error);
          return;
        }

        if (data) {
          const mappedVisitors: VisitorData[] = data.map((item: any, index: number) => {
            let displayedTitle = item.visitors?.title || '';
            if (!displayedTitle && item.visitors?.is_external && item.visitors?.tc_no) {
              const tc = String(item.visitors.tc_no);
              displayedTitle = tc.length >= 4 ? `*******${tc.slice(-4)}` : tc;
            }
            
            return {
              id: item.id?.toString() || Math.random().toString(),
              visitorName: `${item.visitors?.first_name || ''} ${item.visitors?.last_name || ''}`.trim(),
              visitorTitle: displayedTitle,
              hostName: `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim(),
              hostTitle: item.profiles?.role || '',
              date: item.entry_time ? new Date(item.entry_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
              time: item.entry_time ? new Date(item.entry_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
              subject: item.visit_purpose || '',
              status: (item.status as VisitorStatus) || 'success',
              isInternal: item.visitors ? !item.visitors.is_external : false,
            };
          });
          setVisitors(mappedVisitors);
          if (count !== null) {
            setTotalCount(count);
            onTotalCountChange?.(count);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching visitors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to prevent excessive queries while user types
    timeoutId = setTimeout(() => {
      fetchVisitors();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, itemsPerPage, sortOption, departmentId, hostId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center min-h-[300px] w-full bg-transparent">
        <Spinner size="large" color="#63716e" />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      className="w-full shrink"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className={`flex-col shrink bg-transparent w-full ${isCompact ? 'min-w-[700px]' : 'min-w-[1115px]'}`}>
        {/* Table Header */}
        <View className={`flex-row items-center gap-[24px] bg-[#f7f7f7] px-[10px] rounded-lg mb-[4px] w-full ${isCompact ? 'h-[44px]' : 'h-[56px]'}`}>
          <View className="flex-1 flex-row items-center justify-between pr-2">
            <View className="flex-col items-start justify-center w-[160px] shrink-0">
              <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Ziyaret Eden</Text>
            </View>
            <View className="flex-col items-start justify-center w-[120px] shrink-0">
              <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Ziyaret Edilen</Text>
            </View>

            {isCompact ? (
              <View className="flex-col items-start justify-center w-[100px] shrink-0">
                <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Tarih / Saat</Text>
              </View>
            ) : (
              <>
                <View className="flex-col items-start justify-center w-[87px] shrink-0">
                  <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Tarih</Text>
                </View>
                <View className="flex-col items-start justify-center w-[40px] shrink-0">
                  <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Saat</Text>
                </View>
              </>
            )}

            <View className={`flex-col items-start justify-center shrink-0 mr-4 ${isCompact ? 'w-[230px]' : 'w-[430px]'}`}>
              <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Konu</Text>
            </View>
            <View className="flex-col items-start justify-center w-[80px] shrink-0">
              <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3]" style={{ fontFamily: 'DMSans_400Regular' }}>Durum</Text>
            </View>
          </View>
        </View>

        {/* Table Body */}
        <ScrollView className="shrink w-full" showsVerticalScrollIndicator={true}>
          {visitors.map((item) => {
            const isInternalBg = item.isInternal ? 'bg-[#f8fcf3]' : 'bg-white';
            const isActionsRestricted = profile?.department_id && ['74f89e28-b11a-4824-bc7d-3f17d2e1c68a', '4b82177d-a7ad-487e-9d3a-9181a937d99f'].includes(profile.department_id);
            const actionWidth = isActionsRestricted ? 'w-[50px]' : 'w-[130px]';
            const translateXHover = isActionsRestricted ? 'xl:group-hover:translate-x-[50px]' : 'xl:group-hover:translate-x-[130px]';
            const translateXActive = isActionsRestricted ? 'translate-x-[50px]' : 'translate-x-[130px]';

            return (
              <NativePressable
                key={item.id}
                onLongPress={() => setActiveRowId(item.id)}
                delayLongPress={250}
                onPress={() => {
                  if (activeRowId === item.id) setActiveRowId(null);
                }}
                className={`group h-[56px] border-b border-[#e5e6e6] w-full relative overflow-hidden ${isInternalBg}`}
              >
                {/* Sol Taraf Eylemler (Arkaplan) */}
                <View className={`absolute left-0 top-0 bottom-0 ${actionWidth} flex-row items-center justify-start gap-[8px] pl-[10px]`}>
                  <TableActionBadge 
                    theme="solid"
                    actionType="neutral" 
                    icon={Pencil} 
                  />
                  {!isActionsRestricted && (
                    <>
                      <TableActionBadge 
                        theme="solid"
                        actionType="error" 
                        icon={ShieldOff} 
                      />
                      <TableActionBadge 
                        theme="solid"
                        actionType="warning" 
                        icon={Trash2} 
                      />
                    </>
                  )}
                </View>

                {/* Kayan İçerik (Foreground) */}
                <View 
                  className={`flex-1 flex-row items-center justify-between pr-2 gap-[24px] px-[10px] w-full h-[56px] transition-transform duration-300 ease-in-out ${isInternalBg} ${
                    activeRowId === item.id ? translateXActive : ('translate-x-0 ' + translateXHover)
                  }`}
                >
                {/* Ziyaret Eden */}
                <View className="flex-row items-center w-[160px] shrink-0 gap-[10px]">
                  <CustomAvatar name={item.visitorName || '?'} size="sm" />
                  <View className="flex-col items-start justify-center flex-1 gap-[3px]">
                    <Text className="text-[11px] text-[#292929] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                      {item.visitorName || '-'}
                    </Text>
                    <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                      {item.visitorTitle}
                    </Text>
                  </View>
                </View>

                {/* Ziyaret Edilen */}
                <View className="flex-col items-start justify-center w-[120px] shrink-0 gap-[3px]">
                  <Text className="text-[11px] text-[#292929] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                    {item.hostName || '-'}
                  </Text>
                  <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                    {item.hostTitle}
                  </Text>
                </View>

                {/* Tarih & Saat */}
                {isCompact ? (
                  <View className="flex-col items-start justify-center w-[100px] shrink-0 gap-[3px]">
                    <Text className="text-[11px] text-[#292929] font-medium leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_500Medium' }}>
                      {item.date || '-'}
                    </Text>
                    <Text className="text-[10px] text-[#63716e] font-normal leading-[1.3] w-full" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                      {item.time || '-'}
                    </Text>
                  </View>
                ) : (
                  <>
                    <View className="flex-col items-start justify-center w-[87px] shrink-0">
                      <Text className="text-[11px] text-[#292929] font-normal leading-[1.3]" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                        {item.date || '-'}
                      </Text>
                    </View>
                    <View className="flex-col items-start justify-center w-[40px] shrink-0">
                      <Text className="text-[11px] text-[#292929] font-normal leading-[1.3]" numberOfLines={1} style={{ fontFamily: 'DMSans_400Regular' }}>
                        {item.time || '-'}
                      </Text>
                    </View>
                  </>
                )}

                {/* Konu */}
                <View className={`flex-col items-start justify-center shrink-0 mr-4 ${isCompact ? 'w-[230px]' : 'w-[430px]'}`}>
                  <View className={`bg-[#f7f7f7] px-[6px] py-[4px] rounded-[3px] w-full ${isCompact ? 'min-h-[36px]' : ''}`}>
                    <Text className="text-[11px] text-[#203430] font-normal leading-[1.3]" numberOfLines={isCompact ? 2 : 1} style={{ fontFamily: 'DMSans_400Regular' }}>
                      {item.subject || '-'}
                    </Text>
                  </View>
                </View>

                {/* Durum */}
                <View className="flex-col items-start justify-center w-[80px] shrink-0">
                  <CustomBadge status={item.status} className="shrink-0" />
                </View>
              </View>
            </NativePressable>
          );
        })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default VisitorTable;
