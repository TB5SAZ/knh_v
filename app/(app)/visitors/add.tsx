import React, { useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ShieldOff } from 'lucide-react-native';

import { AppButton } from '@/src/components/core/AppButton';
import { AppAlert, AppAlertStatus } from '@/src/components/core/AppAlert';
import { visitorSchema, VisitorFormValues, getDefaultVisitorFormValues } from '@/src/schemas/visitorSchema';
import { visitorService } from '@/src/services/visitorService';
import { useVisitorData } from '@/src/hooks/visitors/useVisitorData';
import { useVisitorSearch } from '@/src/hooks/visitors/useVisitorSearch';
import { useAutoTimeUpdate } from '@/src/hooks/visitors/useAutoTimeUpdate';

import { VisitorHeader } from '@/src/components/visitors/VisitorHeader';
import { VisitorPersonalInfo } from '@/src/components/visitors/VisitorPersonalInfo';
import { VisitorTargetInfo } from '@/src/components/visitors/VisitorTargetInfo';
import { VisitorDetailsInfo } from '@/src/components/visitors/VisitorDetailsInfo';
import { maskTc } from '@/src/utils/validations';

export default function VisitorAddScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const now = new Date();
  const router = useRouter();

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    status: AppAlertStatus;
    onClose: () => void;
    disableCloseForSeconds?: number;
    className?: string;
    titleClassName?: string;
    icon?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    status: 'info',
    onClose: () => {},
  });

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, dirtyFields } } = useForm<VisitorFormValues>({
    mode: 'onChange',
    resolver: zodResolver(visitorSchema) as any,
    defaultValues: getDefaultVisitorFormValues(now)
  });

  const selectedUnitId = watch('unitId');
  const isExternal = watch('isExternal');
  const isForeign = watch('isForeign');
  const firstNameVal = watch('firstName');
  const lastNameVal = watch('lastName');
  const titleVal = watch('title');

  // Hedef Birim / Kişi Verileri Hook'u
  const { 
    userDepartmentName, 
    departments, 
    targetUsers, 
    isLoadingUsers,
    isSecurity,
    isRestrictedSelf,
    isSecretary
  } = useVisitorData(
    selectedUnitId,
    setValue
  );

  // Ziyaretçi Otomatik Tamamlama Arama Hook'u
  const { 
    nameSuggestions, 
    showSuggestions, 
    activeSearchField, 
    searchVisitors, 
    clearSuggestions 
  } = useVisitorSearch();

  // Güvenlikse veya tarih/saat manuel değiştirilmemişse sürekli zamanı güncelle
  useAutoTimeUpdate(setValue, isSecurity, dirtyFields);

  const handleSelectVisitor = (visitor: any) => {
    const unmaskedTc = visitor.tc_no || ''; 
    const tcNoVal = maskTc(unmaskedTc);

    setValue('firstName', visitor.first_name, { shouldValidate: true });
    setValue('lastName', visitor.last_name, { shouldValidate: true });
    setValue('isExternal', visitor.is_external, { shouldValidate: true });
    setValue('isForeign', visitor.is_foreign, { shouldValidate: true });
    setValue('tcNo', tcNoVal, { shouldValidate: true });
    setValue('title', visitor.title || '', { shouldValidate: true });
    setValue('phone', visitor.phone || '', { shouldValidate: true });
    setValue('existingVisitorId', visitor.id);
    
    clearSuggestions();
  };

  const onSubmit = async (data: VisitorFormValues) => {
    try {
      const res = await visitorService.createVisit(data, isSecurity);
      
      if (res.isBlocked) {
        setAlertConfig({
          isOpen: true,
          title: 'Uyarı: Engellenen Ziyaretçi',
          description: `Kayıt oluşturuldu fakat ziyaretçi kara listede olduğu için 'engellendi' olarak işaretlendi.${res.blockReason ? `\n\nSebep: ${res.blockReason}` : ''}`,
          status: 'error',
          disableCloseForSeconds: 5,
          className: 'border-2 border-status-error-text',
          titleClassName: 'text-status-error-text',
          icon: ShieldOff,
          onClose: () => {
            setAlertConfig(prev => ({ ...prev, isOpen: false }));
            router.push('/visitors');
          }
        });
      } else {
        setAlertConfig({
          isOpen: true,
          title: 'Başarılı',
          description: 'Ziyaretçi Kaydı Oluşturuldu',
          status: 'success',
          onClose: () => {
            setAlertConfig(prev => ({ ...prev, isOpen: false }));
            router.push('/visitors');
          }
        });
      }
    } catch (error: any) {
      setAlertConfig({
        isOpen: true,
        title: 'Hata',
        description: error.message || 'Beklenmeyen bir hata oluştu.',
        status: 'error',
        onClose: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-bg-surface" 
      contentContainerClassName="px-[24px] py-[20px]"
      showsVerticalScrollIndicator={false}
    >
      <View className="bg-white rounded-[16px] p-6 md:px-[64px] md:py-[32px] w-full mx-auto">
        <View className="flex-col gap-5">
          
          <VisitorHeader
            control={control as any}
            setValue={setValue as any}
            isExternal={isExternal ?? false}
            isForeign={isForeign ?? false}
            onClearSuggestions={clearSuggestions}
          />

          {/* Divider */}
          <View className="h-px bg-border-default w-full" />

          {/* Body Section */}
          <View className="flex-col gap-6">

            <VisitorPersonalInfo
              control={control as any}
              errors={errors as any}
              setValue={setValue as any}
              isExternal={isExternal ?? false}
              isForeign={isForeign ?? false}
              firstNameVal={firstNameVal ?? ''}
              lastNameVal={lastNameVal ?? ''}
              titleVal={titleVal ?? ''}
              searchVisitors={searchVisitors}
              showSuggestions={showSuggestions}
              activeSearchField={activeSearchField}
              nameSuggestions={nameSuggestions}
              onSelectVisitor={handleSelectVisitor}
            />

            <VisitorTargetInfo
              control={control as any}
              errors={errors as any}
              departments={departments}
              targetUsers={targetUsers}
              selectedUnitId={selectedUnitId}
              isLoadingUsers={isLoadingUsers}
              isRestrictedSelf={isRestrictedSelf}
              isSecretary={isSecretary}
            />

            <VisitorDetailsInfo
              control={control as any}
              errors={errors as any}
              isMobile={isMobile}
              isSecurity={isSecurity}
            />

          </View>

          {/* Divider */}
          <View className="h-px bg-border-default w-full" />

          {/* Footer */}
          <View className="flex-row w-full md:justify-end">
            <View className="w-full md:w-auto">
              <AppButton 
                title="Ziyaretçi Ekle" 
                variant="primary" 
                size="lg"
                className="w-full md:w-auto md:min-w-[124px]"
                onPress={handleSubmit(onSubmit as any)}
              />
            </View>
          </View>
          
        </View>
      </View>

      <AppAlert 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        status={alertConfig.status}
        onClose={alertConfig.onClose}
        disableCloseForSeconds={alertConfig.disableCloseForSeconds}
        className={alertConfig.className}
        titleClassName={alertConfig.titleClassName}
        icon={alertConfig.icon}
      />
    </ScrollView>
  );
}
