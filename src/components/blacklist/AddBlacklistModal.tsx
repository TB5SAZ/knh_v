import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/providers/AuthProvider';
import { TARGET_DEPARTMENTS } from '@/src/constants/departments';
import { AppAlert, AppAlertStatus } from '../core/AppAlert';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@/src/components/ui/modal';
import { AlertTriangle, X } from 'lucide-react-native';
import { AppInput } from '../core/AppInput';
import { AppSelect } from '../core/AppSelect';
import { AppButton } from '../core/AppButton';

const isValidTC = (tc: string) => {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const digits = tc.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  if ((sumOdd * 7 - sumEven) % 10 !== digits[9]) return false;
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== digits[10]) return false;
  return true;
};

const schema = z.object({
  tcNo: z.string()
    .length(11, 'TC No 11 haneli olmalıdır')
    .regex(/^\d+$/, 'Sadece rakam içermelidir')
    .refine(isValidTC, 'Geçersiz TC Kimlik No'),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  department: z.string().min(1, 'Kısım / Departman seçmelisiniz'),
  personnel: z.string().min(1, 'Lütfen ilgili kişiyi seçiniz'),
  reason: z.string().min(10, 'Engellenme nedeni en az 10 karakter olmalıdır'),
});

type FormValues = z.infer<typeof schema>;

export interface AddBlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    tcNo?: string;
    firstName?: string;
    lastName?: string;
  };
}

export function AddBlacklistModal({ isOpen, onClose, onSuccess, initialData }: AddBlacklistModalProps) {
  const { user, profile } = useAuth();
  
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
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      tcNo: initialData?.tcNo || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      department: '',
      personnel: '',
      reason: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        tcNo: initialData?.tcNo || '',
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        department: '',
        personnel: '',
        reason: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const selectedDepartment = watch('department');
  const tcNoValue = watch('tcNo');

  const [departments, setDepartments] = useState<{label: string, value: string}[]>([]);
  const [personnelOptions, setPersonnelOptions] = useState<{label: string, value: string}[]>([]);

  // Watch TC No and auto-fill if visitor exists
  React.useEffect(() => {
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

  React.useEffect(() => {
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

      const { data, error } = await query;
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

  React.useEffect(() => {
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

      const { data, error } = await query;
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

  const onSubmit = async (data: FormValues) => {
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
          added_by: user?.id || null, // Or any relevant field
          visitor_id: visitorId,
          // status is probably active by default in the db
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
      if (onSuccess) {
        onSuccess();
      }
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

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalBackdrop className="bg-black/50" />
      <ModalContent className="bg-white w-[90%] max-w-[400px] border-0">
        <ModalHeader className="pb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AlertTriangle color="#ef4444" size={20} />
            <Text className="text-body-16-semibold text-text-primary" style={{ fontFamily: 'DMSans_600SemiBold' }}>
              Kara Listeye Ekle
            </Text>
          </View>
          <ModalCloseButton onPress={handleClose}>
            <X size={20} color="#6e6f78" />
          </ModalCloseButton>
        </ModalHeader>
        
        <ModalBody className="py-4">
          <View className="flex-col gap-4">
            <Controller
              control={control}
              name="tcNo"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="TC Kimlik No"
                  placeholder="11 haneli TC kimlik no giriniz"
                  keyboardType="numeric"
                  maxLength={11}
                  value={value}
                  onChangeText={onChange}
                  error={errors.tcNo?.message}
                />
              )}
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Ad"
                      placeholder="Kişinin adını giriniz"
                      value={value}
                      onChangeText={(text) => {
                        const formatted = text.split(' ').map(word => 
                          word ? word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR') : ''
                        ).join(' ');
                        onChange(formatted);
                      }}
                      error={errors.firstName?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Soyad"
                      placeholder="Kişinin soyadını giriniz"
                      value={value}
                      onChangeText={(text) => {
                        const formatted = text.toLocaleUpperCase('tr-TR');
                        onChange(formatted);
                      }}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="department"
              render={({ field: { onChange, value } }) => (
                <View style={{ zIndex: 10 }}>
                  <Text className="text-body-11-medium text-text-secondary mb-1.5" style={{ fontFamily: 'DMSans_500Medium' }}>
                    Kısım / Departman
                  </Text>
                  <AppSelect
                    options={departments}
                    placeholder={departments.length > 0 ? "Seçiniz" : "Yükleniyor..."}
                    selectedValue={value}
                    onValueChange={(val) => {
                      onChange(val);
                      // Clear personnel selection when department changes
                      setValue('personnel', '');
                    }}
                    isDisabled={isOther}
                    className={errors.department ? 'border-status-error-text' : ''}
                  />
                  {errors.department && (
                    <Text className="text-body-11-regular text-status-error-text mt-1" style={{ fontFamily: 'DMSans_400Regular' }}>
                      {errors.department.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="personnel"
              render={({ field: { onChange, value } }) => (
                <View style={{ zIndex: 5 }}>
                  <Text className="text-body-11-medium text-text-secondary mb-1.5" style={{ fontFamily: 'DMSans_500Medium' }}>
                    Kişi
                  </Text>
                  <AppSelect
                    options={personnelOptions}
                    placeholder={selectedDepartment ? "Kişi seçiniz" : "Önce departman seçiniz"}
                    selectedValue={value}
                    onValueChange={onChange}
                    isDisabled={!selectedDepartment || isOther}
                    className={errors.personnel ? 'border-status-error-text' : ''}
                  />
                  {errors.personnel && (
                    <Text className="text-body-11-regular text-status-error-text mt-1" style={{ fontFamily: 'DMSans_400Regular' }}>
                      {errors.personnel.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="reason"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="text-body-11-medium text-text-secondary mb-1.5" style={{ fontFamily: 'DMSans_500Medium' }}>
                    Engellenme Nedeni
                  </Text>
                  <AppInput
                    multiline
                    numberOfLines={4}
                    placeholder="Lütfen detaylı açıklama giriniz..."
                    value={value}
                    onChangeText={(text) => {
                      const formatted = text ? text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1) : '';
                      onChange(formatted);
                    }}
                    error={errors.reason?.message}
                  />
                </View>
              )}
            />
          </View>
        </ModalBody>
        
        <ModalFooter className="pt-4 flex-row justify-end gap-3">
          <AppButton 
            title="İptal" 
            variant="ghost" 
            onPress={handleClose} 
            className="px-6 bg-[#f5f5f5]"
            isDisabled={isLoading}
          />
          <AppButton 
            title="Kara Listeye Ekle" 
            variant="error" 
            onPress={handleSubmit(onSubmit)} 
            className="px-6"
            isLoading={isLoading}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>

    <AppAlert
      isOpen={alertState.isOpen}
      onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      title={alertState.title}
      description={alertState.description}
      status={alertState.status}
    />
    </>
  );
}
