import { supabase } from '../lib/supabase';
import { VisitorData, VisitorStatus } from '../types/visitor';
import { TARGET_DEPARTMENTS } from '../constants/departments';

interface RawVisitorData {
  id?: number | string | null;
  entry_time?: string | null;
  visit_purpose?: string | null;
  status?: string | null;
  created_by?: string | null;
  visited_person_id?: string | null;
  visitors?: {
    first_name?: string | null;
    last_name?: string | null;
    title?: string | null;
    tc_no?: string | null;
    is_external?: boolean | null;
  } | null;
  profiles?: {
    first_name?: string | null;
    last_name?: string | null;
    role?: string | null;
    department_id?: string | null;
  } | null;
}

// Helper: Formats external raw data to internal UI component layout
export const mapVisitorData = (item: RawVisitorData): VisitorData => {
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
    createdBy: item.created_by || undefined,
    visitedPersonId: item.visited_person_id || undefined,
    hostDepartmentId: item.profiles?.department_id || undefined,
  };
};

// Helper: Initializes base query and handles possible fulltext search logic
export const buildBaseQuery = async (safeQuery: string) => {
  let query = supabase
    .from('visits')
    .select(`
      id,
      visit_purpose,
      entry_time,
      status,
      created_by,
      visited_person_id,
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
    const { data: matchingVisitors } = await supabase
      .from('visitors')
      .select('id')
      .or(`first_name.ilike."%${safeQuery}%",last_name.ilike."%${safeQuery}%",tc_no.ilike."%${safeQuery}%"`)
      .limit(200);
      
    const visitorIds = matchingVisitors?.map(v => v.id) || [];

    if (visitorIds.length > 0) {
      query = query.or(`visit_purpose.ilike."%${safeQuery}%",visitor_id.in.(${visitorIds.join(',')})`);
    } else {
      query = query.or(`visit_purpose.ilike."%${safeQuery}%"`);
    }
  }

  return { builder: query };
};

// Helper: Chains on filters (department, specific host) and pagination controls
export const applyFiltersAndSort = (
  query: any, // Supabase query builder instance
  params: {
    profile: { department_id?: string | null } | null | undefined;
    user: { id?: string } | null | undefined;
    departmentId: string;
    hostId: string;
    sortOption: string;
    from: number;
    to: number;
  }
) => {
  const { profile, user, departmentId, hostId, sortOption, from, to } = params;

  // Özel yetkili profilin yalnızca belirli departmanları görme kontrolü
  if (profile?.department_id === TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID) {
    query = query.eq('profiles.department_id', TARGET_DEPARTMENTS.RESTRICTED_VIEW_DEPT_ID);
  } else if (departmentId) {
    query = query.eq('profiles.department_id', departmentId);
  }

  if (hostId) {
    query = query.eq('visited_person_id', hostId);
  }

  // Güvenlik departmanı kendisi oluşturanları görür
  if (profile?.department_id === TARGET_DEPARTMENTS.SECURITY_DEPT_ID && user?.id) {
    query = query.eq('created_by', user.id);
  }

  // Diğer departman çalışanları sadece kendilerine gelen ziyaretçileri görebilir
  const isSpecialDept = profile?.department_id && [
    TARGET_DEPARTMENTS.ADMIN_DEPT_ID,
    TARGET_DEPARTMENTS.SECURITY_DEPT_ID,
    TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID
  ].includes(profile.department_id);

  if (!isSpecialDept && user?.id) {
    query = query.eq('visited_person_id', user.id);
  }



  // Özel admin departmanı dışındakiler silinenleri göremez
  if (profile?.department_id !== TARGET_DEPARTMENTS.ADMIN_DEPT_ID) {
    query = query.neq('status', 'deleted');
  }

  const [sortBy, order] = sortOption.split('-');
  
  if (sortBy.includes('.')) {
    const [table, column] = sortBy.split('.');
    return query.order(column, { foreignTable: table, ascending: order === 'asc' }).range(from, to);
  }

  return query.order(sortBy, { ascending: order === 'asc' }).range(from, to);
};
