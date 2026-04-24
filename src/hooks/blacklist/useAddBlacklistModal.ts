import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/src/lib/supabase';
import { TARGET_DEPARTMENTS } from '@/src/constants/departments';
import { AppAlertStatus } from '@/src/components/core/AppAlert';
import { AddBlacklistFormValues } from '@/src/schemas/blacklist.schema';

export function useAddBlacklistModal(
  isOpen: boolean,
  onClose: () => void,
  methods: UseFormReturn<AddBlacklistFormValues>,
  user: any,
  profile: any,
  onSuccess?: () => void
) {
  const isAdmin = profile?.role === 'admin' || profile?.department_id === TARGET_DEPARTMENTS.ADMIN_DEPT_ID;
  const isSecretary = profile?.department_id === TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID;
  const isOther = !isAdmin && !isSecretary;

  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    status: AppAlertStatus;
    title: string;
    description: string;
  }>({
    isOpen: false,
    status: 'info',
    title: '',
    description: '',
  });

  const [departments, setDepartments] = useState<{label: string, value: string}[]>([]);
  const [personnelOptions, setPersonnelOptions] = useState<{label: string, value: string}[]>([]);

  const { watch, setValue, reset } = methods;
  const selectedDepartment = watch('department');
  const tcNoValue = watch('tcNo');

  // Watch TC No and auto-fill if visitor exists
  useEffect(() => {
    if (tcNoValue?.length === 11) {
      const fetchVisitor = async () => {
        const { data } = await supabase
          .from('visitors')
          .select('id, first_name, last_name')
          .eq('tc_no', tcNoValue)
          .single();
          
        if (data) {
          setValue('firstName', data.first_name);
          setValue('lastName', data.last_name);
        }
      };
      fetchVisitor();
    }
  }, [tcNoValue, setValue]);

  useEffect(() => {
    async function fetchDepartments() {
      let query = supabase
        .from('departments')
        .select('id, name')
        .eq('is_selectable', true)
        .order('name');
        
      if (isSecretary) {
        query = query.eq('id', TARGET_DEPARTMENTS.RESTRICTED_VIEW_DEPT_ID);
      } else if (isOther && profile?.department_id) {
        query = query.eq('id', profile.department_id);
      }

      const { data } = await query;
      if (data) {
        setDepartments(data.map(d => ({ label: d.name, value: d.id })));
        if ((isSecretary || isOther) && data.length === 1) {
          setValue('department', data[0].id);
        }
      }
    }
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen, isSecretary, isOther, profile?.department_id, setValue]);

  useEffect(() => {
    async function fetchPersonnel() {
      if (!selectedDepartment) {
        setPersonnelOptions([]);
        return;
      }
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('department_id', selectedDepartment);

      if (isOther && profile?.id) {
        query = query.eq('id', profile.id);
      }

      const { data } = await query;
      if (data) {
        setPersonnelOptions(data.map(p => ({ 
          label: `${p.first_name} ${p.last_name}${p.role ? ` / ${p.role}` : ''}`, 
          value: p.id 
        })));
        if (isOther && data.length === 1) {
          setValue('personnel', data[0].id);
        }
      }
    }
    if (isOpen) {
      fetchPersonnel();
    }
  }, [selectedDepartment, isOpen, isOther, profile?.id, setValue]);

  const onSubmit = async (data: AddBlacklistFormValues) => {
    try {
      setIsLoading(true);

      // Check if visitor already exists
      let visitorId: string;
      const { data: existingVisitor } = await supabase
        .from('visitors')
        .select('id')
        .eq('tc_no', data.tcNo)
        .single();
        
      if (existingVisitor) {
        visitorId = existingVisitor.id;
      } else {
        // Create visitor if they don't exist
        const { data: newVisitor, error: visitorError } = await supabase
          .from('visitors')
          .insert([{
            tc_no: data.tcNo,
            first_name: data.firstName,
            last_name: data.lastName,
          }])
          .select('id')
          .single();
          
        if (visitorError) throw new Error("Ziyaretçi kaydı oluşturulurken hata: " + visitorError.message);
        visitorId = newVisitor.id;
      }

      const { error } = await supabase.from('blacklist').insert([
        {
          department: data.department,
          personnel: data.personnel,
          reason: data.reason,
          added_by: user?.id || null,
          visitor_id: visitorId,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setAlertState({
        isOpen: true,
        status: 'success',
        title: 'Başarılı',
        description: 'Kişi başarıyla kara listeye eklendi',
      });
      
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        status: 'error',
        title: 'Kayıt Hatası',
        description: err.message || 'Veritabanına kayıt sırasında bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return {
    departments,
    personnelOptions,
    isLoading,
    alertState,
    setAlertState,
    onSubmit,
    handleClose,
    isOther
  };
}
