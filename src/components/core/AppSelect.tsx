import React, { useState } from 'react';
import { Text, View, Pressable, Modal, FlatList, useWindowDimensions, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '../ui/select';
import { ChevronDown, Check } from 'lucide-react-native';

export interface AppSelectProps {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  isDisabled?: boolean;
  className?: string;
}

// ─── Mobile Select: uses React Native Modal directly ───
function MobileAppSelect({
  options,
  placeholder,
  selectedValue,
  onValueChange,
  isDisabled = false,
  className,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = selectedValue ? options.find(opt => opt.value === selectedValue) : null;
  const displayText = selectedOption ? selectedOption.label : (placeholder || 'Seçiniz');

  const handleSelect = (value: string) => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (!isDisabled) setIsOpen(true);
        }}
        className={`bg-bg-surface px-3 h-[36px] min-h-[36px] rounded-lg border border-transparent flex-row items-center justify-between w-full ${isDisabled ? 'opacity-40' : ''} ${className || ''}`}
      >
        <Text
          className={`flex-1 text-[14px] ${selectedOption ? '!text-text-secondary' : '!text-text-secondary'}`}
          style={{ fontFamily: 'DMSans_400Regular' }}
          numberOfLines={1}
        >
          {typeof displayText === 'string' ? displayText.split(' / ')[0] : displayText}
        </Text>
        <View className="ml-2">
          <ChevronDown size={18} color="#64748b" />
        </View>
      </TouchableOpacity>

      {/* Full-screen modal picker */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          onPress={() => setIsOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '60%',
                paddingBottom: 34,
                width: '100%',
              }}
            >
            {/* Drag indicator */}
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 2 }} />
            </View>

            {/* Options list */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f1f5f9',
                      backgroundColor: isSelected ? '#f0fdf4' : 'white',
                    }}
                  >
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text
                        style={{
                          fontSize: 15,
                          color: isSelected ? '#16a34a' : '#374151',
                          fontFamily: isSelected ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                        }}
                      >
                        {item.label.split(' / ')[0]}
                      </Text>
                      {item.label.includes(' / ') && (
                        <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                          {item.label.substring(item.label.indexOf(' / ') + 3)}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Check size={18} color="#16a34a" />}
                  </Pressable>
                );
              }}
            />
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Desktop Select: Custom Implementation to completely replace Gluestack ───
function DesktopAppSelect({
  options,
  placeholder,
  selectedValue,
  onValueChange,
  isDisabled = false,
  className,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<any>(null);
  const [dropdownLayout, setDropdownLayout] = React.useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleOpen = () => {
    if (isDisabled) return;
    
    if (Platform.OS === 'web') {
      try {
        // Use native web bounding client rect for perfect coordinates
        const element = triggerRef.current as any;
        if (element && typeof element.getBoundingClientRect === 'function') {
          const rect = element.getBoundingClientRect();
          setDropdownLayout({ top: rect.bottom, left: rect.left, width: rect.width });
          setIsOpen(true);
          return;
        }
      } catch (e) {
        console.error("Error measuring select trigger on web", e);
      }
    }
    
    // Fallback for native/other cases
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setDropdownLayout({ top: y + height, left: x, width });
        setIsOpen(true);
      });
    }
  };

  return (
    <>
      <Pressable 
        ref={triggerRef}
        onPress={handleOpen}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isOpen ? '#16a34a' : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        }}
        className={`w-full ${!className?.includes('bg-') ? 'bg-bg-surface' : ''} ${!className?.includes('h-') ? 'h-[36px]' : ''} ${!className?.includes('p') ? 'px-3' : ''} ${className || ''}`}
      >
        <Text 
          style={{ fontFamily: 'DMSans_400Regular', color: selectedValue ? '#374151' : '#9ca3af', fontSize: 14 }} 
          numberOfLines={1}
          className="flex-1"
        >
          {typeof displayValue === 'string' ? displayValue.split(' / ')[0] : displayValue}
        </Text>
        <ChevronDown size={18} color="#64748b" />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        {/* Backdrop */}
        <Pressable 
          nativeID="app-select-backdrop"
          style={{ flex: 1, backgroundColor: 'transparent' }} 
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            nativeID="app-select-dropdown"
            style={{
              position: 'absolute',
              top: dropdownLayout.top + 4,
              left: dropdownLayout.left,
              width: dropdownLayout.width,
              backgroundColor: 'white',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              overflow: 'hidden',
              zIndex: 9999
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: selectedValue === item.value ? '#f0fdf4' : 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f8fafc'
                  }}
                >
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={{ 
                      fontFamily: selectedValue === item.value ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                      color: selectedValue === item.value ? '#16a34a' : '#475569',
                      fontSize: 14
                    }}>
                      {item.label.split(' / ')[0]}
                    </Text>
                    {item.label.includes(' / ') && (
                      <Text style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                        {item.label.substring(item.label.indexOf(' / ') + 3)}
                      </Text>
                    )}
                  </View>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Main export: picks the right implementation based on screen width ───
export function AppSelect(props: AppSelectProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (isMobile) {
    return <MobileAppSelect {...props} />;
  }
  return <DesktopAppSelect {...props} />;
}
