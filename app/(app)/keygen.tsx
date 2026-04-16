import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { AppSelect } from '@/src/components/core/AppSelect';
import { AppButton } from '@/src/components/core/AppButton';
import { AppAlert } from '@/src/components/core/AppAlert';
import { RefreshCw, Copy, Save } from 'lucide-react-native';
import { useAuth } from '@/src/providers/AuthProvider';
import { useKeygen } from '@/src/hooks/useKeygen';

export default function KeygenPage() {
  const { role } = useAuth();
  
  const {
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
  } = useKeygen();

  if (role !== 'Sistem Yöneticisi') {
    return <Redirect href="/dashboard" />;
  }

  return (
    <ScrollView 
      className="flex-1 bg-bg-main" 
      contentContainerClassName="p-4 md:p-6 lg:p-8"
      showsVerticalScrollIndicator={false}
    >
      <View className="max-w-3xl mx-auto w-full">
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-heading-20-semibold text-text-primary mb-2">
            Akıllı Yetki Anahtarı Üretimi
          </Text>
          <Text className="text-body-14-regular text-text-secondary">
            Kayıt olacak personelin departmanını ve rolünü seçerek, ona özel eşsiz sisteme giriş anahtarı tanımlayabilirsiniz.
          </Text>
        </View>

        {/* Main Card */}
        <View className="bg-bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
          <View className="p-6 md:p-8">
            
            {/* Input Section (Cascading Pickers) */}
            <View className="mb-8 flex-col gap-5">
              <View>
                <Text className="text-body-11-medium text-text-secondary mb-1.5">Departman Seçimi</Text>
                <AppSelect
                  placeholder="Bir departman seçiniz..."
                  options={departments.length > 0 ? departments : [{ label: 'Yükleniyor...', value: '' }]}
                  selectedValue={selectedDepartmentId}
                  onValueChange={setSelectedDepartmentId}
                />
              </View>

              <View>
                <Text className="text-body-11-medium text-text-secondary mb-1.5">Rol (Unvan) Seçimi</Text>
                <AppSelect
                  placeholder={selectedDepartmentId ? "Seçilen departmana ait bir rol seçiniz..." : "Önce departman seçiniz"}
                  options={roleOptions.length > 0 ? roleOptions : [{ label: '-', value: '' }]}
                  selectedValue={selectedRole}
                  onValueChange={setSelectedRole}
                />
              </View>
            </View>

            {/* Key Display Area */}
            <View className="mb-8">
              <Text className="text-body-12-medium text-text-secondary mb-2">
                Oluşturulan Anahtar (32 Karakter)
              </Text>
              <View className="bg-bg-subtle border border-border-light rounded-xl p-4 md:p-6 flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text 
                    className="text-heading-16-semibold text-brand-primary tracking-wider"
                    selectable={true}
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}
                  >
                    {generatedKey}
                  </Text>
                </View>
                <AppButton 
                  onPress={handleCopy} 
                  variant="ghost" 
                  size="md" 
                  leftIcon={Copy} 
                  title="Kopyala" 
                />
              </View>
            </View>

            {/* Actions */}
            <View className="flex-col md:flex-row gap-4 items-center justify-between pt-2 border-t border-border-light">
              <AppButton
                onPress={handleGenerateKey}
                variant="secondary"
                size="lg"
                leftIcon={RefreshCw}
                title="Yeni Anahtar Üret"
                className="w-full md:w-auto"
              />
              <AppButton
                onPress={handleSave}
                variant="primary"
                size="lg"
                leftIcon={Save}
                title="Sisteme Kaydet"
                isLoading={isSaving}
                className="w-full md:w-auto"
              />
            </View>

          </View>
        </View>
      </View>

      <AppAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertConfig.title}
        description={alertConfig.description}
        status={alertConfig.status}
        confirmText="Tamam"
      />
    </ScrollView>
  );
}
