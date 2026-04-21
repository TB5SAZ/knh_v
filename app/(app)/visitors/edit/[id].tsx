import React, { useEffect, useState } from 'react';
import { View, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

export default function VisitorEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const now = new Date();

  const [isLoading, setIsLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    status: AppAlertStatus;
    onClose: () => void;
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

  // Fetch initial data
  useEffect(() => {
    if (!id) return;
    
    const fetchVisit = async () => {
      try {
        const visit = await visitorService.getVisitById(id);
        const visitor = visit.visitor;
        const department_id = visit.visited_person?.department_id;
        const entryTime = new Date(visit.entry_time);

        reset({
          existingVisitorId: visitor.id,
          isExternal: visitor.is_external ?? true,
          firstName: visitor.first_name || '',
          lastName: visitor.last_name || '',
          isForeign: visitor.is_foreign ?? false,
          tcNo: visitor.tc_no || '',
          title: visitor.title || '',
          phone: visitor.phone || '',
          unitId: department_id || '',
          targetUserId: visit.visited_person_id || '',
          visitDate: entryTime,
          visitTime: entryTime,
          visitReason: visit.visit_purpose || '',
        });
      } catch (error: any) {
        setAlertConfig({
          isOpen: true,
          title: 'Hata',
          description: error.message || 'Kayıt bulunamadı.',
          status: 'error',
          onClose: () => {
            setAlertConfig(prev => ({ ...prev, isOpen: false }));
            router.back();
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisit();
  }, [id, reset, router]);

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

  // We do NOT use auto-time update in edit mode!
  // useAutoTimeUpdate(setValue, isSecurity, dirtyFields);

  const handleSelectVisitor = (visitor: any) => {
    // Disabled in edit mode
  };

  const onSubmit = async (data: VisitorFormValues) => {
    try {
      await visitorService.updateVisit(id, data, false);
      setAlertConfig({
        isOpen: true,
        title: 'Başarılı',
        description: 'Ziyaret başarıyla güncellendi.',
        status: 'success',
        onClose: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
          router.push('/visitors');
        }
      });
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-surface">
        <ActivityIndicator size="large" color="#63716e" />
      </View>
    );
  }

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
            isEditMode={true}
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
              showSuggestions={false} // Disabled logic
              activeSearchField={null} // Disabled
              nameSuggestions={[]} // Disabled
              onSelectVisitor={handleSelectVisitor}
              isEditMode={true}
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
                title="Kaydet / Güncelle" 
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
      />
    </ScrollView>
  );
}
