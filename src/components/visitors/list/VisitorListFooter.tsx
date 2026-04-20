import React from 'react';
import { View, Text } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { AppSelect } from '@/src/components/core/AppSelect';
import { AppPagination } from '@/src/components/core/AppPagination';

interface VisitorListFooterProps {
  isMobile: boolean;
  isCompact: boolean;
  filters: ReturnType<typeof import('../../../hooks/visitors/useVisitorFilters')['useVisitorFilters']>;
}

export const VisitorListFooter = ({
  isMobile,
  isCompact,
  filters
}: VisitorListFooterProps) => {
  const {
    totalCount,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage
  } = filters;

  return (
    <View className={`flex flex-row flex-wrap md:flex-nowrap items-center w-full mt-2 gap-4 md:gap-8 ${isMobile ? 'justify-center' : 'justify-between'}`}>
      {/* Pagination Info */}
      {!isMobile && (
        <HStack className="flex-1 items-center gap-2 flex-wrap min-w-[250px]">
          <Text className="text-[#757575] text-sm font-normal" style={{ fontFamily: 'DMSans_400Regular' }}>
            {totalCount} kayıttan
          </Text>
          <View className="w-[80px]">
            <AppSelect
                options={[
                  { label: '10', value: '10' },
                  { label: '20', value: '20' },
                  { label: '50', value: '50' },
                  { label: '100', value: '100' },
                ]}
                selectedValue={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
            />
          </View>
          <Text className="text-[#757575] text-sm font-normal" style={{ fontFamily: 'DMSans_400Regular' }}>
            tanesi görüntüleniyor.
          </Text>
        </HStack>
      )}

      {/* Legend Indicator */}
      {!isCompact && (
        <HStack className="items-center gap-1.5 shrink-0 px-2 lg:px-4">
          <View className="size-3.5 rounded-full bg-[#e4f2d3]" />
          <Text className="text-[#63716e] text-xs font-normal" style={{ fontFamily: 'DMSans_400Regular' }}>
            Kurum İçi
          </Text>
        </HStack>
      )}

      {/* Pagination Controls */}
      <View className="w-full md:w-auto max-w-full flex-row items-center justify-center">
        <AppPagination 
          currentPage={currentPage} 
          totalPages={Math.ceil(totalCount / itemsPerPage) || 1} 
          onPageChange={(page) => setCurrentPage(page)} 
          size={isCompact ? 'sm' : 'md'}
        />
      </View>
    </View>
  );
};
