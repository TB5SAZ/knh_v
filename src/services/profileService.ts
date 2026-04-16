import { supabase } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';

export async function fetchProfilesByDepartment(departmentId: string): Promise<{id: string, first_name: string, last_name: string}[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('department_id', departmentId);

  if (error) {
    logger.error('Kullanıcılar getirilirken hata oluştu:', error);
    return [];
  }

  return data || [];
}
