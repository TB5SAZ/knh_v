import { useState, useMemo } from 'react';

export const useVisitorFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOption, setSortOption] = useState('entry_time-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  return useMemo(() => ({
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    sortOption, setSortOption,
    showFilters, setShowFilters,
    selectedDepartment, setSelectedDepartment,
    selectedProfile, setSelectedProfile,
    totalCount, setTotalCount
  }), [
    searchQuery, 
    currentPage, 
    itemsPerPage, 
    sortOption, 
    showFilters, 
    selectedDepartment, 
    selectedProfile, 
    totalCount
  ]);
};
