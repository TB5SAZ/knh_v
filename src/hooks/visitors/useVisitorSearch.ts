import { useState } from 'react';
import { searchVisitorsService } from '@/src/services/visitorService';

export function useVisitorSearch() {
  const [nameSuggestions, setNameSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'name' | 'title' | null>(null);
  const [isSearchingNames, setIsSearchingNames] = useState(false);

  const searchVisitors = async (fName: string, lName: string, tName: string, source: 'name' | 'title') => {
    const fSafe = fName.trim();
    const lSafe = lName.trim();
    const tSafe = (tName || '').trim();

    if (fSafe.length < 2 && lSafe.length < 2 && tSafe.length < 2) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      setActiveSearchField(null);
      return;
    }
    
    setIsSearchingNames(true);
    const data = await searchVisitorsService(fSafe, lSafe, tSafe);
      
    if (data) {
      setActiveSearchField(source);
      setNameSuggestions(data);
      setShowSuggestions(data.length > 0);
    }
    setIsSearchingNames(false);
  };

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
    searchVisitors,
    clearSuggestions,
    setShowSuggestions,
    setActiveSearchField,
  };
}
