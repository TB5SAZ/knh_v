import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Spinner } from '../ui/spinner';
import { useAuth } from '../../providers/AuthProvider';
import { useVisitorTableData } from '../../hooks/visitors/useVisitorTableData';
import { VisitorTableHeader } from './table/VisitorTableHeader';
import { VisitorTableRow } from './table/VisitorTableRow';
import { TARGET_DEPARTMENTS } from '../../constants/departments';

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
    setActiveRowId
  } = useVisitorTableData({
    searchQuery,
    currentPage,
    itemsPerPage,
    sortOption,
    departmentId,
    hostId,
    onTotalCountChange
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center min-h-[300px] w-full bg-transparent">
        <Spinner size="large" color="#63716e" />
      </View>
    );
  }

  const isActionsRestricted = profile?.department_id 
    ? [TARGET_DEPARTMENTS.SPECIAL_AUTH_DEPT_ID, TARGET_DEPARTMENTS.SECURITY_DEPT_ID].includes(profile.department_id) 
    : false;

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      className="w-full shrink"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className={`flex-col shrink bg-transparent w-full ${isCompact ? 'min-w-[700px]' : 'min-w-[1115px]'}`}>
        <VisitorTableHeader isCompact={isCompact} />

        <ScrollView className="shrink w-full" showsVerticalScrollIndicator={true}>
          {visitors.map((item) => (
            <VisitorTableRow 
              key={item.id} 
              item={item} 
              isCompact={isCompact}
              isActionsRestricted={isActionsRestricted}
              activeRowId={activeRowId}
              setActiveRowId={setActiveRowId}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default VisitorTable;
