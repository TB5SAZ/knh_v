import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { VStack } from '@/src/components/ui/vstack';
import VisitorTable from './VisitorTable';
import { fetchSelectableDepartments } from '@/src/services/departmentService';
import { fetchProfilesByDepartment } from '@/src/services/profileService';
import { VisitorListHeader } from './list/VisitorListHeader';
import { VisitorListFooter } from './list/VisitorListFooter';
import { useVisitorFilters } from '@/src/hooks/visitors/useVisitorFilters';

interface VisitorListCardProps {
  onAddVisitor?: () => void;
}

export function VisitorListCard({ onAddVisitor }: VisitorListCardProps = {}) {
  const filters = useVisitorFilters();
  
  const [departments, setDepartments] = React.useState<{label: string, value: string}[]>([]);
  const [profiles, setProfiles] = React.useState<{label: string, value: string}[]>([]);

  const { width } = useWindowDimensions();
  const isCompact = width < 1280;
  const isMobile = width < 768;

  // Sadece component mount edildiğinde departmanları çek
  React.useEffect(() => {
    fetchSelectableDepartments().then((data) => {
      setDepartments([{ label: 'Tüm Birimler', value: '' }, ...data.map(d => ({ label: d.name, value: d.id }))]);
    });
  }, []);

  // Departman değiştiğinde kişileri (profilleri) getir
  React.useEffect(() => {
    if (filters.selectedDepartment) {
      fetchProfilesByDepartment(filters.selectedDepartment).then((data) => {
        setProfiles([{ label: 'Tüm Kişiler', value: '' }, ...data.map(p => ({ 
          label: `${p.first_name} ${p.last_name}${p.role ? ` / ${p.role}` : ''}`, 
          value: p.id 
        }))]);
      });
      filters.setSelectedProfile(''); // Departman değişirse kişiyi sıfırla
    } else {
      setProfiles([]);
      filters.setSelectedProfile('');
    }
  }, [filters.selectedDepartment]);

  return (
    <VStack className="bg-white rounded-2xl p-4 md:p-6 gap-4 w-full shrink">
      <View style={{ zIndex: 10 }}>
        <VisitorListHeader 
          isMobile={isMobile}
          isCompact={isCompact}
          filters={filters}
          departments={departments}
          profiles={profiles}
          onAddVisitor={onAddVisitor}
        />
      </View>

      <View className="w-full overflow-hidden shrink mt-1 md:mt-2">
        <VisitorTable 
          searchQuery={filters.searchQuery}
          currentPage={filters.currentPage}
          itemsPerPage={filters.itemsPerPage}
          sortOption={filters.sortOption}
          departmentId={filters.selectedDepartment}
          hostId={filters.selectedProfile}
          onTotalCountChange={filters.setTotalCount}
        />
      </View>

      <VisitorListFooter 
        isMobile={isMobile}
        isCompact={isCompact}
        filters={filters}
      />
    </VStack>
  );
}

export default VisitorListCard;
