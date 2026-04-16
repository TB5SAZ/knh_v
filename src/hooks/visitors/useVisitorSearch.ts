import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useAsyncOperation } from '../useAsyncOperation';
import { visitorService } from '@/src/services/visitorService';
import { Visitor } from '../../types/visitor';

export function useVisitorSearch() {
  const [nameSuggestions, setNameSuggestions] = useState<Visitor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'name' | 'title' | null>(null);

  const { loading: isSearchingNames, error: searchError, execute } = useAsyncOperation<Visitor[]>();

  const searchVisitors = useDebouncedCallback(
    async (fName: string, lName: string, tName: string, source: 'name' | 'title') => {
      const fSafe = fName.trim();
      const lSafe = lName.trim();
      const tSafe = (tName || '').trim();

      if (fSafe.length < 2 && lSafe.length < 2 && tSafe.length < 2) {
        setNameSuggestions([]);
        setShowSuggestions(false);
        setActiveSearchField(null);
        return;
      }

      const querySegments = [fSafe, lSafe, tSafe].filter(Boolean);
      const query = querySegments.join(' ');

      const data = await execute(() => visitorService.searchVisitors(query));

      if (data) {
        setActiveSearchField(source);
        setNameSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    },
    300
  );

  const clearSuggestions = () => {
    setNameSuggestions([]);
    setShowSuggestions(false);
    setActiveSearchField(null);
  };

  return {
    nameSuggestions,
    showSuggestions,
    activeSearchField,
    isSearchingNames,
    searchError,
    searchVisitors,
    clearSuggestions,
    setShowSuggestions,
    setActiveSearchField,
  };
}
