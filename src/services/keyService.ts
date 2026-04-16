import { supabase } from '@/src/lib/supabase';
import { logger } from '@/src/utils/logger';

export const keyService = {
  /**
   * Yeni bir kayıt anahtarı (registration key) oluşturur ve veritabanına kaydeder.
   */
  async createRegistrationKey(key_value: string, assigned_role: string, department_id: string) {
    const { error } = await supabase.from('registration_keys').insert([
      { 
        key_value, 
        assigned_role,
        department_id,
        is_used: false 
      }
    ]);

    if (error) {
      logger.error('[keyService] createRegistrationKey error:', error);
      throw new Error(error.message);
    }
  }
};
