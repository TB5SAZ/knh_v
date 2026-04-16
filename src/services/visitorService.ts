import { supabase } from '@/src/lib/supabase';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';
import { Visitor } from '../types/visitor';

interface VisitorUpdateData {
  first_name?: string;
  last_name?: string;
  title?: string | null;
  phone?: string | null;
  is_foreign?: boolean;
  is_external?: boolean;
  tc_no?: string | null;
}

export const visitorService = {
  async searchVisitors(query: string): Promise<Visitor[]> {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,tc_no.ilike.%${query}%`)
      .limit(10);

    if (error) {
      throw new Error(`Ziyaretçi arama hatası: ${error.message}`);
    }

    return data || [];
  },

  async createVisit(data: VisitorFormValues, isSecurity: boolean): Promise<{ success: boolean; visitId?: string }> {
    try {
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

      const { data: visitData, error: visitErr } = await supabase
        .from('visits')
        .insert({
          visitor_id: visitorId,
          visited_person_id: data.targetUserId,
          visit_purpose: data.visitReason,
          entry_time: combinedDateTime.toISOString()
        })
        .select('id')
        .single();

      if (visitErr) {
        throw new Error(`Kayıt oluşturulurken bir hata oluştu: ${visitErr.message}`);
      }

      return { success: true, visitId: visitData?.id };
    } catch (error) {
      console.error('Visit creation error:', error);
      throw error;
    }
  }
};

