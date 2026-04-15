import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import { fetchAllDepartments } from '@/src/services/departmentService';
import { keyService } from '@/src/services/keyService';

export const DEPARTMENT_ROLES: Record<string, string[]> = {
  'Başhekimlik': ['Başhekim', 'Başhekim Yrd.'],
  'Güvenlik': ['Güvenlik Amiri', 'Güvenlik Görevlisi'],
  'Admin': ['Sistem Yöneticisi'],
  'İdari ve Mali Hiz.': ['İdari ve Mali Hiz. Müd.', 'İdari ve Mali Hiz. Müd. Yrd.'],
  'Sağlık Bakım Hiz.': ['Sağlık Bakım Hiz. Müd.', 'Sağlık Bakım Hiz. Müd. Yrd.'],
  'Destek ve Kalite': ['Destek ve Kalite Müd.', 'Destek ve Kalite Müd. Yrd.'],
  'Sekreter': ['Sekreter']
};

function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

export function useKeygen() {
  const [departments, setDepartments] = useState<Array<{ label: string; value: string }>>([]);
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

  const handleGenerateKey = () => {
    setGeneratedKey(generateRandomKey());
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
