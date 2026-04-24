import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const paginationButton = tva({
  base: 'flex items-center justify-center rounded-lg shrink-0',
  variants: {
    state: {
      active: 'bg-brand-primary',
      inactive: 'bg-bg-surface',
      disabled: 'bg-bg-surface opacity-50',
      ellipsis: 'bg-transparent',
    },
    size: {
      sm: 'w-7 h-7', // 28x28
      md: 'w-8 h-8', // 32x32
    },
  },
  defaultVariants: {
    state: 'inactive',
    size: 'md',
  },
});

const paginationText = tva({
  base: 'text-body-12-medium text-center',
  variants: {
    state: {
      active: 'text-white',
      inactive: 'text-text-primary',
      disabled: 'text-text-primary opacity-50',
      ellipsis: 'text-text-primary',
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
});

export type AppPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: 'sm' | 'md';
};

const generatePagination = (current: number, total: number, size: 'sm' | 'md' = 'md') => {
  if (size === 'sm') {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 2) return [1, 2, '...', total - 1, total];
    if (current >= total - 1) return [1, 2, '...', total - 1, total];
    return [1, '...', current, '...', total];
  }

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total - 1, total];
  }

  if (current >= total - 2) {
    return [1, 2, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
};

export function AppPagination({ currentPage, totalPages, onPageChange, size = 'md' }: AppPaginationProps) {
  const pages = useMemo(() => generatePagination(currentPage, totalPages, size), [currentPage, totalPages, size]);

  if (totalPages <= 1) {
    return null;
  }

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <View className={`flex-row items-center justify-center ${size === 'sm' ? 'gap-1' : 'gap-2'}`}>
      <Pressable
        className={paginationButton({ state: currentPage === 1 ? 'disabled' : 'inactive', size })}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={iconSize} color={currentPage === 1 ? '#a4acab' : '#203430'} />
      </Pressable>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <View key={`ellipsis-${index}`} className={paginationButton({ state: 'ellipsis', size })}>
              <Text className={paginationText({ state: 'ellipsis' })} style={{ fontFamily: 'DMSans_500Medium' }}>...</Text>
            </View>
          );
        }

        const isActive = page === currentPage;
        return (
          <Pressable
            key={`page-${page}`}
            className={paginationButton({ state: isActive ? 'active' : 'inactive', size })}
            onPress={() => typeof page === 'number' && onPageChange(page)}
          >
            <Text className={paginationText({ state: isActive ? 'active' : 'inactive' })} style={{ fontFamily: 'DMSans_500Medium' }}>
              {page}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        className={paginationButton({ state: currentPage === totalPages ? 'disabled' : 'inactive', size })}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={iconSize} color={currentPage === totalPages ? '#a4acab' : '#203430'} />
      </Pressable>
    </View>
  );
}

export default AppPagination;
