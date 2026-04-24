import { supabase } from '@/src/lib/supabase';
import { AppError } from '@/src/utils/errors';
import { VisitorFormValues, visitorSchema } from '@/src/schemas/visitorSchema';
import { Visitor, VisitorUpdateData } from '../types/visitor';
import { logger } from '@/src/utils/logger';

const POSTGRES_UNIQUE_VIOLATION = '23505';

// --- HELPER FUNCTIONS ---

const buildCombinedDateTime = (data: VisitorFormValues, isSecurity: boolean): Date => {
  if (isSecurity) return new Date();
  return new Date(
    data.visitDate.getFullYear(),
    data.visitDate.getMonth(),
    data.visitDate.getDate(),
    data.visitTime.getHours(),
    data.visitTime.getMinutes(),
    0,
    0
  );
};

const upsertVisitorInformation = async (data: VisitorFormValues): Promise<string> => {
  let visitorId = data.existingVisitorId;

  if (!visitorId) {
    const newVisitorData = {
      first_name: data.firstName,
      last_name: data.lastName,
      tc_no: (data.isExternal && !data.isForeign) ? data.tcNo : (data.isExternal && data.isForeign ? data.tcNo : null),
      title: !data.isExternal ? data.title : null,
      phone: data.phone || null,
      is_foreign: data.isForeign,
      is_external: data.isExternal,
    };

    const { data: newVis, error: visErr } = await supabase
      .from('visitors')
      .insert(newVisitorData)
      .select('id')
      .single();

    if (visErr) {
      if (visErr.code === POSTGRES_UNIQUE_VIOLATION) {
        throw new AppError('Bu T.C. Kimlik / Pasaport no ile kayıtlı başka bir ziyaretçi bulunuyor. Lütfen listeden seçin.');
      }
      throw new AppError(`Ziyaretçi kaydedilirken hata oluştu: ${visErr.message}`);
    }
    if (!newVis) throw new AppError('Visitor ID oluşturulamadı.');
    return newVis.id;
  }

  const updateVisitorData: VisitorUpdateData = {
    first_name: data.firstName,
    last_name: data.lastName,
    title: !data.isExternal ? data.title : null,
    phone: data.phone || null,
    is_foreign: data.isForeign,
    is_external: data.isExternal,
  };

  const hasMaskedTc = data.tcNo && data.tcNo.includes('*');
  if (!hasMaskedTc) {
    updateVisitorData.tc_no = (data.isExternal && !data.isForeign) ? data.tcNo : (data.isExternal && data.isForeign ? data.tcNo : null);
  }

  const { error: updateErr } = await supabase
    .from('visitors')
    .update(updateVisitorData)
    .eq('id', visitorId);

  if (updateErr) {
    if (updateErr.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new AppError('Bu T.C. Kimlik / Pasaport no ile kayıtlı başka bir ziyaretçi bulunuyor.');
    }
    throw new AppError(`Ziyaretçi bilgileri güncellenirken hata oluştu: ${updateErr.message}`);
  }

  return visitorId;
};

const createVisitRecord = async (
  visitorId: string, 
  data: VisitorFormValues, 
  combinedDateTime: Date,
  isBlocked?: boolean
): Promise<string> => {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData.user?.id;

  if (!currentUserId) {
    throw new AppError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const { data: visitData, error: visitErr } = await supabase
    .from('visits')
    .insert({
      visitor_id: visitorId,
      visited_person_id: data.targetUserId,
      visit_purpose: data.visitReason,
      entry_time: combinedDateTime.toISOString(),
      created_by: currentUserId,
      status: isBlocked ? 'blocked' : 'pending' // Defaulting to pending or whatever default is. Wait, if I don't pass status, it defaults in DB. 
    })
    .select('id')
    .single();

  if (visitErr) {
    throw new AppError(`Kayıt oluşturulurken bir hata oluştu: ${visitErr.message}`);
  }
  if (!visitData) throw new AppError('Visit record ID not returned.');

  return visitData.id;
};

const fetchStatsByRange = async (start: Date, end?: Date) => {
  const { data, error } = await supabase.rpc('get_visitor_monthly_stats', {
    p_start: start.toISOString(),
    p_end: end ? end.toISOString() : undefined,
  });

  if (error) {
    logger.error('Error fetching stats by range:', error);
    return { total: 0, internal: 0, external: 0, blocked: 0, cancelled: 0 };
  }

  return data as { total: number; internal: number; external: number; blocked: number; cancelled: number; };
};

const calculateTrendForStats = (curr: number, prev: number) => {
  if (prev === 0) return curr > 0 ? '+100%' : '0%';
  const diff = ((curr - prev) / prev) * 100;
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
};

// --- SERVICE OBJECT ---

export const visitorService = {
  /**
   * Search visitors by first name, last name, or TC No/Passport No.
   * @param query - The search string.
   * @returns Array of matching visitors (max 10).
   * @throws AppError if search fails.
   */
  async searchVisitors(query: string): Promise<Visitor[]> {
    const safeQuery = query.replace(/[%",]/g, '');
    const { data, error } = await supabase
      .from('visitors')
      .select('id, first_name, last_name, tc_no, title, phone, is_foreign, is_external, created_at')
      .or(`first_name.ilike."%${safeQuery}%",last_name.ilike."%${safeQuery}%",tc_no.ilike."%${safeQuery}%"`)
      .limit(10);

    if (error) {
      throw new AppError(`Ziyaretçi arama hatası: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Creates a new visit record and upserts visitor information if necessary.
   * @param data - The visitor form values from UI.
   * @param isSecurity - Check if the user acting is a Security Personnel.
   * @returns Result indicating success and the new visit ID.
   * @throws AppError if any database operation fails.
   */
  async createVisit(data: VisitorFormValues, isSecurity: boolean): Promise<{ success: boolean; visitId?: string; isBlocked?: boolean; blockReason?: string }> {
    try {
      visitorSchema.parse(data);
      
      const combinedDateTime = buildCombinedDateTime(data, isSecurity);
      const visitorId = await upsertVisitorInformation(data);

      let isBlocked = false;
      let blockReason = '';

      if (visitorId) {
        const { data: blacklistData, error: blacklistError } = await supabase
          .from('blacklist')
          .select('reason')
          .eq('visitor_id', visitorId)
          .eq('personnel', data.targetUserId)
          .limit(1)
          .maybeSingle();
          
        if (blacklistError) {
          logger.error('Error checking blacklist:', blacklistError);
        } else if (blacklistData) {
          isBlocked = true;
          blockReason = blacklistData.reason;
        }
      }
      
      const visitId = await createVisitRecord(visitorId, data, combinedDateTime, isBlocked);

      return { success: true, visitId, isBlocked, blockReason };
    } catch (error) {
      logger.error('Visit creation error:', error);
      throw error;
    }
  },

  /**
   * Fetches monthly visitor statistics including trends comparing current and previous months.
   * @returns Object containing totals and trend percentages.
   */
  async getMonthlyVisitorStats() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfPrevMonth = new Date(startOfMonth);
      startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

      const currentStats = await fetchStatsByRange(startOfMonth);
      const previousStats = await fetchStatsByRange(startOfPrevMonth, startOfMonth);

      return {
        ...currentStats,
        trends: {
          total: calculateTrendForStats(currentStats.total, previousStats.total),
          internal: calculateTrendForStats(currentStats.internal, previousStats.internal),
          external: calculateTrendForStats(currentStats.external, previousStats.external),
          blocked: calculateTrendForStats(currentStats.blocked, previousStats.blocked),
          cancelled: calculateTrendForStats(currentStats.cancelled, previousStats.cancelled)
        }
      };
    } catch (error) {
      logger.error('Error fetching monthly visitor stats:', error);
      const zeroTrend = '0%';
      return { 
        total: 0, internal: 0, external: 0, blocked: 0, cancelled: 0,
        trends: { total: zeroTrend, internal: zeroTrend, external: zeroTrend, blocked: zeroTrend, cancelled: zeroTrend }
      };
    }
  },

  /**
   * Retrieves full details for a single visit by its ID.
   * @param visitId - UUID of the visit record.
   * @returns The visit object with relationships included.
   * @throws AppError if fetch fails.
   */
  async getVisitById(visitId: string) {
    const { data: visit, error } = await supabase
      .from('visits')
      .select(`
        id,
        visit_purpose,
        entry_time,
        status,
        created_by,
        visited_person_id,
        visitor:visitor_id (id, first_name, last_name, tc_no, title, phone, is_foreign, is_external, created_at),
        visited_person:profiles!visits_visited_person_id_fkey (department_id)
      `)
      .eq('id', visitId)
      .single();

    if (error) {
      throw new AppError(`Ziyaret bilgisi alınırken hata oluştu: ${error.message}`);
    }

    return visit;
  },

  /**
   * Updates an existing visit's details.
   * @param visitId - UUID of the visit to update.
   * @param data - The new data payload.
   * @param isSecurity - If acting as a security guard (affects time calculation).
   * @returns Result indicating success.
   * @throws AppError if update fails or insufficient permissions.
   */
  async updateVisit(visitId: string, data: VisitorFormValues, isSecurity: boolean): Promise<{ success: boolean }> {
    try {
      const combinedDateTime = buildCombinedDateTime(data, isSecurity);

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id;
      if (!currentUserId) throw new AppError('Oturum bilgisi bulunamadı.');

      const { data: updatedData, error: visitErr } = await supabase
        .from('visits')
        .update({
          visited_person_id: data.targetUserId,
          visit_purpose: data.visitReason,
          entry_time: combinedDateTime.toISOString(),
        })
        .eq('id', visitId)
        .select('id');

      if (visitErr) throw new AppError(`Ziyaret güncellenirken hata oluştu: ${visitErr.message}`);
      if (!updatedData || updatedData.length === 0) {
        throw new AppError('Bu kaydı güncellemek için yetkiniz bulunmamaktadır.');
      }

      return { success: true };
    } catch (error) {
      logger.error('Visit update error:', error);
      throw error;
    }
  },

  /**
   * Soft deletes or permanently deletes a visit by ID.
   * @param visitId - UUID of the visit.
   * @param isSoftDelete - If true, changes status to 'deleted'. If false, removes from table.
   * @returns Result indicating success.
   * @throws AppError if deletion fails.
   */
  async deleteVisit(visitId: string, isSoftDelete = true): Promise<{ success: boolean }> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id;
      if (!currentUserId) throw new AppError('Oturum bilgisi bulunamadı.');

      if (isSoftDelete) {
        const { error: updateErr } = await supabase
          .from('visits')
          .update({ status: 'deleted' })
          .eq('id', visitId);

        if (updateErr) {
          throw new AppError(`Ziyaret silinirken hata oluştu: ${updateErr.message}`);
        }
      } else {
        const { error: deleteErr } = await supabase
          .from('visits')
          .delete()
          .eq('id', visitId);
          
        if (deleteErr) {
          throw new AppError(`Ziyaret kalıcı olarak silinirken hata oluştu: ${deleteErr.message}`);
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('Visit delete error:', error);
      throw error;
    }
  }
};

