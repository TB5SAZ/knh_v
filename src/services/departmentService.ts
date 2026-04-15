import { supabase } from '@/src/lib/supabase';

/**
 * Belirli bir departman kimliğine (ID) göre departmanın adını getirir.
 * 
 * @param departmentId - Sordugumuz departmanın benzersiz kimliği
 * @returns Departman adı veya hata/bulunamama durumunda `null`
 */
export async function fetchUserDepartmentName(departmentId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('name')
      .eq('id', departmentId)
      .single();

    if (error) {
      console.error(`Departman (${departmentId}) adı getirilirken hata:`, error.message);
      return null;
    }

    return data?.name ?? null;
  } catch (err) {
    console.error(`Departman (${departmentId}) getirme işleminde beklenmeyen hata:`, err);
    return null;
  }
}

/**
 * Kullanıcıların seçim yapabileceği departmanların listesini getirir.
 * 'Admin', 'Sekreter' ve 'Güvenlik' gibi idari/özel departmanlar sonuçtan filtrelenir.
 * 
 * @returns Seçilebilir departmanların listesi ({ id, name } formatında)
 */
export async function fetchSelectableDepartments(): Promise<{ id: string; name: string }[]> {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .eq('is_selectable', true)
      .order('name');
      
    if (error) {
      console.error('Seçilebilir departmanlar getirilirken hata oluştu:', error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Seçilebilir departmanlar getirme işleminde beklenmeyen hata:', err);
    return [];
  }
}

/**
 * Sistemdeki tüm departmanları getirir. (Genellikle Admin/Keygen işlemleri için)
 * @returns Tüm departmanların listesi ({ id, name } formatında)
 */
export async function fetchAllDepartments(): Promise<{ id: string; name: string }[]> {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');
      
    if (error) {
      console.error('Departmanlar getirilirken hata oluştu:', error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Departman listesi getirme işleminde beklenmeyen hata:', err);
    return [];
  }
}
