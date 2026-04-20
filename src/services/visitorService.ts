import { supabase } from '@/src/lib/supabase';
import { VisitorFormValues, visitorSchema } from '@/src/schemas/visitorSchema';
import { Visitor, VisitorUpdateData } from '../types/visitor';
import { logger } from '@/src/utils/logger';

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
      if (visErr.code === '23505') {
        throw new Error('Bu T.C. Kimlik / Pasaport no ile kayıtlı başka bir ziyaretçi bulunuyor. Lütfen listeden seçin.');
      }
      throw new Error(`Ziyaretçi kaydedilirken hata oluştu: ${visErr.message}`);
    }
    if (!newVis) throw new Error('Visitor ID oluşturulamadı.');
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
    if (updateErr.code === '23505') {
      throw new Error('Bu T.C. Kimlik / Pasaport no ile kayıtlı başka bir ziyaretçi bulunuyor.');
    }
    throw new Error(`Ziyaretçi bilgileri güncellenirken hata oluştu: ${updateErr.message}`);
  }

  return visitorId;
};

const createVisitRecord = async (
  visitorId: string, 
  data: VisitorFormValues, 
  combinedDateTime: Date
): Promise<string> => {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData.user?.id;

  if (!currentUserId) {
    throw new Error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
  }

  const { data: visitData, error: visitErr } = await supabase
    .from('visits')
    .insert({
      visitor_id: visitorId,
      visited_person_id: data.targetUserId,
      visit_purpose: data.visitReason,
      entry_time: combinedDateTime.toISOString(),
      created_by: currentUserId,
    })
    .select('id')
    .single();

  if (visitErr) {
    throw new Error(`Kayıt oluşturulurken bir hata oluştu: ${visitErr.message}`);
  }
  if (!visitData) throw new Error('Visit record ID not returned.');

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
  async searchVisitors(query: string): Promise<Visitor[]> {
    const safeQuery = query.replace(/[%",]/g, '');
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .or(`first_name.ilike."%${safeQuery}%",last_name.ilike."%${safeQuery}%",tc_no.ilike."%${safeQuery}%"`)
      .limit(10);

    if (error) {
      throw new Error(`Ziyaretçi arama hatası: ${error.message}`);
    }

    return data || [];
  },

  async createVisit(data: VisitorFormValues, isSecurity: boolean): Promise<{ success: boolean; visitId?: string }> {
    try {
      visitorSchema.parse(data);
      
      const combinedDateTime = buildCombinedDateTime(data, isSecurity);
      const visitorId = await upsertVisitorInformation(data);
      const visitId = await createVisitRecord(visitorId, data, combinedDateTime);

      return { success: true, visitId };
    } catch (error) {
      logger.error('Visit creation error:', error);
      throw error;
    }
  },

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
  }
};
