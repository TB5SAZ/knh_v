import { supabase } from '@/src/lib/supabase';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';

export async function searchVisitorsService(fName: string, lName: string, tName: string) {
  let query = supabase.from('visitors').select('*');

  if (fName.length >= 2) query = query.ilike('first_name', `%${fName}%`);
  if (lName.length >= 2) query = query.ilike('last_name', `%${lName}%`);
  if (tName.length >= 2) query = query.ilike('title', `%${tName}%`);

  const { data, error } = await query.limit(5);

  if (error) {
    console.error('Ziyaretçi aranırken hata oluştu:', error);
    return [];
  }

  return data || [];
}

export async function saveVisitorAndVisit(data: VisitorFormValues, isSecurity: boolean) {
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
    // Yeni kişi oluştur
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
      } else {
        throw new Error('Ziyaretçi kaydedilirken hata oluştu: ' + visErr.message);
      }
    }
    if (newVis) {
      visitorId = newVis.id;
    }
  } else {
    // Var olan kişiyi GÜNCELLE
    const updateVisitorData: any = {
      first_name: data.firstName,
      last_name: data.lastName,
      title: !data.isExternal ? data.title : null,
      phone: data.phone || null,
      is_foreign: data.isForeign,
      is_external: data.isExternal,
    };

    // Eğer maskeli değilse (yeni yazılmışsa) tc_no'yu güncelle, maskeliyse eskisini koru
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
      } else {
        throw new Error('Ziyaretçi bilgileri güncellenirken hata oluştu: ' + updateErr.message);
      }
    }
  }
  
  if (!visitorId) {
     throw new Error('Visitor ID oluşturulamadı.');
  }

  const { error: visitErr } = await supabase
    .from('visits')
    .insert({
      visitor_id: visitorId,
      visited_person_id: data.targetUserId,
      visit_purpose: data.visitReason,
      entry_time: combinedDateTime.toISOString()
    });

  if (visitErr) {
    throw new Error('Kayıt oluşturulurken bir hata oluştu: ' + visitErr.message);
  }

  return true;
}
