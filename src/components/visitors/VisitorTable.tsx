import React, { useState } from 'react';
import { ScrollView, View, Text, useWindowDimensions } from 'react-native';
import { Spinner } from '../ui/spinner';
import { useAuth } from '../../providers/AuthProvider';
import { useVisitorTableData } from '../../hooks/visitors/useVisitorTableData';
import { VisitorTableHeader } from './table/VisitorTableHeader';
import { VisitorTableRow } from './table/VisitorTableRow';
import { TARGET_DEPARTMENTS } from '../../constants/departments';
import { AppAlert, AppAlertStatus } from '../core/AppAlert';
import { visitorService } from '../../services/visitorService';
import { AddBlacklistModal } from '../blacklist/AddBlacklistModal';

interface VisitorTableProps {
  searchQuery?: string;
  currentPage?: number;
  itemsPerPage?: number;
  sortOption?: string;
  departmentId?: string;
  hostId?: string;
  onTotalCountChange?: (count: number) => void;
}

export const VisitorTable = ({ 
  searchQuery = '',
  currentPage = 1,
  itemsPerPage = 10,
  sortOption = 'entry_time-desc',
  departmentId = '',
  hostId = '',
  onTotalCountChange
}: VisitorTableProps) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 1280;
  const { profile } = useAuth();
  
  const {
    visitors,
    isLoading,
    activeRowId,
    setActiveRowId,
    refresh
  } = useVisitorTableData({
    searchQuery,
    currentPage,
    itemsPerPage,
    sortOption,
    departmentId,
    hostId,
    onTotalCountChange
  });

  const isAdmin = profile?.role === 'admin' || profile?.department_id === TARGET_DEPARTMENTS.ADMIN_DEPT_ID;
  const isAdminDept = profile?.department_id === TARGET_DEPARTMENTS.ADMIN_DEPT_ID;

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    status: AppAlertStatus;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    status: 'info',
  });

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockModalData, setBlockModalData] = useState<{ tcNo?: string; firstName?: string; lastName?: string }>();

  const handleDelete = (id: string) => {
    setAlertConfig({
      isOpen: true,
      title: 'Kaydı Sil',
      description: 'Bu ziyaretçi kaydını silmek istediğinizden emin misiniz?',
      status: 'warning',
      confirmText: 'Sil',
      onConfirm: async () => {
        try {
          await visitorService.deleteVisit(id);
          setAlertConfig({
            isOpen: true,
            title: 'Başarılı',
            description: 'Kayıt başarıyla silindi.',
            status: 'success',
            onConfirm: () => refresh(),
          });
        } catch (err: any) {
          setAlertConfig({
            isOpen: true,
            title: 'Hata',
            description: err.message || 'Kayıt silinirken bir hata oluştu.',
            status: 'error',
          });
        }
      },
    });
  };

  const handleBlock = async (id: string) => {
    try {
      const visit = await visitorService.getVisitById(id);
      if (visit?.visitor) {
        setBlockModalData({
          tcNo: visit.visitor.tc_no || '',
          firstName: visit.visitor.first_name || '',
          lastName: visit.visitor.last_name || '',
        });
        setIsBlockModalOpen(true);
      }
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        title: 'Hata',
        description: err.message || 'Ziyaretçi bilgileri alınırken hata oluştu.',
        status: 'error',
      });
    }
  };

  return (
    <>
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      className="w-full shrink"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className={`flex-col shrink bg-transparent w-full ${isCompact ? 'min-w-[700px]' : 'min-w-[1115px]'}`}>
        <VisitorTableHeader isCompact={isCompact} />

        <ScrollView 
          className="shrink w-full" 
          style={{ minHeight: itemsPerPage * 56 }} 
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading && visitors.length === 0 ? (
            <View className="flex-1 items-center justify-center h-full" style={{ minHeight: itemsPerPage * 56 }}>
              <Spinner size="large" color="#63716e" />
            </View>
          ) : visitors.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-10 pb-10">
              <Text className="text-body-14-medium text-text-secondary" style={{ fontFamily: 'DMSans_500Medium' }}>
                Kayıt bulunamadı.
              </Text>
            </View>
          ) : (
            <View className={`w-full ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {visitors.map((item) => (
                <VisitorTableRow 
                  key={item.id} 
                  item={item} 
                  isCompact={isCompact}
                  activeRowId={activeRowId}
                  setActiveRowId={setActiveRowId}
                  currentUserId={profile?.id}
                  isAdmin={isAdmin}
                  isAdminDept={isAdminDept}
                  isSecurity={profile?.department_id === TARGET_DEPARTMENTS.SECURITY_DEPT_ID}
                  isSecretary={profile?.department_id === TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID}
                  onDelete={handleDelete}
                  onBlock={handleBlock}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScrollView>
    
    <AppAlert 
      isOpen={alertConfig.isOpen}
      onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      title={alertConfig.title}
      description={alertConfig.description}
      status={alertConfig.status}
      confirmText={alertConfig.confirmText}
      onConfirm={alertConfig.onConfirm}
    />

    <AddBlacklistModal 
      isOpen={isBlockModalOpen} 
      onClose={() => setIsBlockModalOpen(false)} 
      initialData={blockModalData}
    />
    </>
  );
};

export default VisitorTable;
