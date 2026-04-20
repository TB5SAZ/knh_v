import { supabase } from '@/src/lib/supabase';
import { VisitorFormValues, visitorSchema } from '@/src/schemas/visitorSchema';
import { Visitor, VisitorUpdateData } from '../types/visitor';
import { logger } from '@/src/utils/logger';

export const visitorService = {
  async searchVisitors(query: string): Promise<Visitor[]> {
    const safeQuery = query.replace(/[%,]/g, '');
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .or(`first_name.ilike.%${safeQuery}%,last_name.ilike.%${safeQuery}%,tc_no.ilike.%${safeQuery}%`)
      .limit(10);

    if (error) {
      throw new Error(`Ziyaretçi arama hatası: ${error.message}`);
    }

    return data || [];
  },

  async createVisit(data: VisitorFormValues, isSecurity: boolean): Promise<{ success: boolean; visitId?: string }> {
    try {
      visitorSchema.parse(data);
      let visitorId = data.existingVisitorId;
          
      const combinedDateTime = isSecurity 
        ? new Date() 
        : new Date(
            data.visitDate.getFullYear(),
            data.visitDate.getMonth(),
            data.visitDate.getDate(),
            data.visitTime.getHours(),
            data.visitTime.getMinutes(),
            0,
            0
          );

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
        if (newVis) visitorId = newVis.id;
      } else {
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
      }
      
      if (!visitorId) {
        throw new Error('Visitor ID oluşturulamadı.');
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id;

      const { data: visitData, error: visitErr } = await supabase
        .from('visits')
        .insert({
          visitor_id: visitorId,
          visited_person_id: data.targetUserId,
          visit_purpose: data.visitReason,
          entry_time: combinedDateTime.toISOString(),
          created_by: currentUserId || null,
        })
        .select('id')
        .single();

      if (visitErr) {
        throw new Error(`Kayıt oluşturulurken bir hata oluştu: ${visitErr.message}`);
      }

      return { success: true, visitId: visitData?.id };
    } catch (error) {
      logger.error('Visit creation error:', error);
      throw error;
    }
  },

  async getMonthlyVisitorStats(): Promise<{
    total: number;
    internal: number;
    external: number;
    blocked: number;
    cancelled: number;
    trends: {
      total: string;
      internal: string;
      external: string;
      blocked: string;
      cancelled: string;
    }
  }> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfPrevMonth = new Date(startOfMonth);
      startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

      const [
        totalRes, internalRes, externalRes, blockedRes, cancelledRes,
        prevTotalRes, prevInternalRes, prevExternalRes, prevBlockedRes, prevCancelledRes
      ] = await Promise.all([
        supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('entry_time', startOfMonth.toISOString()),
        supabase
          .from('visits')
          .select('*, visitors!inner(is_external)', { count: 'exact', head: true })
          .gte('entry_time', startOfMonth.toISOString())
          .eq('visitors.is_external', false),
        supabase
          .from('visits')
          .select('*, visitors!inner(is_external)', { count: 'exact', head: true })
          .gte('entry_time', startOfMonth.toISOString())
          .eq('visitors.is_external', true),
        supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('entry_time', startOfMonth.toISOString())
          .eq('status', 'blocked'),
        supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('entry_time', startOfMonth.toISOString())
          .eq('status', 'cancelled'),
        
        supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('entry_time', startOfPrevMonth.toISOString())
          .lt('entry_time', startOfMonth.toISOString()),
        supabase
          .from('visits')
          .select('*, visitors!inner(is_external)', { count: 'exact', head: true })
          .gte('entry_time', startOfPrevMonth.toISOString())
          .lt('entry_time', startOfMonth.toISOString())
          .eq('visitors.is_external', false),
        supabase
          .from('visits')
          .select('*, visitors!inner(is_external)', { count: 'exact', head: true })
          .gte('entry_time', startOfPrevMonth.toISOString())
          .lt('entry_time', startOfMonth.toISOString())
          .eq('visitors.is_external', true),
        supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('entry_time', startOfPrevMonth.toISOString())
          .lt('entry_time', startOfMonth.toISOString())
          .eq('status', 'blocked'),
        supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('entry_time', startOfPrevMonth.toISOString())
          .lt('entry_time', startOfMonth.toISOString())
          .eq('status', 'cancelled')
      ]);

      const calculateTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? '+100%' : '0%';
        const diff = ((curr - prev) / prev) * 100;
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
      };

      return {
        total: totalRes.count || 0,
        internal: internalRes.count || 0,
        external: externalRes.count || 0,
        blocked: blockedRes.count || 0,
        cancelled: cancelledRes.count || 0,
        trends: {
          total: calculateTrend(totalRes.count || 0, prevTotalRes.count || 0),
          internal: calculateTrend(internalRes.count || 0, prevInternalRes.count || 0),
          external: calculateTrend(externalRes.count || 0, prevExternalRes.count || 0),
          blocked: calculateTrend(blockedRes.count || 0, prevBlockedRes.count || 0),
          cancelled: calculateTrend(cancelledRes.count || 0, prevCancelledRes.count || 0)
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

