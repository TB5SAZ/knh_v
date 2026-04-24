import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import { fetchAllDepartments } from '@/src/services/departmentService';
import { keyService } from '@/src/services/keyService';
import { generateSecureKey } from '../utils/secureRandom';
import { DEPARTMENT_ROLES } from '../constants';

export function useKeygen() {
  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const [generatedKey, setGeneratedKey] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    title: '', 
    description: '', 
    status: 'success' as 'success' | 'error' | 'info' | 'warning' 
  });

  useEffect(() => {
    handleGenerateKey();
    loadDepartments();
  }, []);

  // Reset role selection down the cascade when department changes
  useEffect(() => {
    setSelectedRole('');
  }, [selectedDepartmentId]);

  const loadDepartments = async () => {
    const data = await fetchAllDepartments();
    if (data.length > 0) {
      setDepartments(data.map(d => ({ value: d.id.toString(), label: d.name })));
    }
  };

  const handleGenerateKey = async () => {
    const key = await generateSecureKey(32);
    setGeneratedKey(key);
  };

  const handleCopy = async () => {
    if (generatedKey) {
      await Clipboard.setStringAsync(generatedKey);
      setAlertConfig({ 
        title: 'Kopyalandı!', 
        description: 'Anahtar panoya başarıyla kopyalandı.', 
        status: 'info' 
      });
      setIsAlertOpen(true);
    }
  };

  const handleSave = async () => {
    if (!generatedKey) return;
    if (!selectedDepartmentId) {
      setAlertConfig({ 
        title: 'Eksik Bilgi', 
        description: 'Lütfen bir departman seçiniz.', 
        status: 'error' 
      });
      setIsAlertOpen(true);
      return;
    }
    if (!selectedRole) {
      setAlertConfig({ 
        title: 'Eksik Bilgi', 
        description: 'Lütfen seçili departmana ait bir rol seçiniz.', 
        status: 'error' 
      });
      setIsAlertOpen(true);
      return;
    }
    
    setIsSaving(true);
    try {
      await keyService.createRegistrationKey(generatedKey, selectedRole, selectedDepartmentId);

      setAlertConfig({ 
        title: 'Başarılı', 
        description: 'Anahtar başarıyla kaydedildi ve kullanıma hazır.', 
        status: 'success' 
      });
      setIsAlertOpen(true);
      setSelectedDepartmentId('');
      setSelectedRole('');
      handleGenerateKey();
    } catch (error: any) {
      setAlertConfig({ 
        title: 'Hata', 
        description: 'Anahtar kaydedilirken bir hata oluştu: ' + error.message, 
        status: 'error' 
      });
      setIsAlertOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute available roles from mapping for the second picker
  const selectedDepartmentName = departments.find(d => d.value === selectedDepartmentId)?.label || '';
  const availableRoles = DEPARTMENT_ROLES[selectedDepartmentName] || [];
  const roleOptions = availableRoles.map(r => ({ label: r, value: r }));

  return {
    departments,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedRole,
    setSelectedRole,
    generatedKey,
    isAlertOpen,
    setIsAlertOpen,
    isSaving,
    alertConfig,
    handleGenerateKey,
    handleCopy,
    handleSave,
    roleOptions
  };
}
