import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlertCircle } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FormControl, FormControlLabel } from '@/components/ui/form-control';

export interface AppDateTimePickerProps {
  label?: string;
  error?: string;
  value?: Date | null;
  onChange?: (date: Date) => void;
  className?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  disabled?: boolean;
}

export function AppDateTimePicker({
  label,
  error,
  value,
  onChange,
  className = '',
  placeholder = 'Seçiniz',
  mode = 'datetime',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled = false
}: AppDateTimePickerProps) {
  const isInvalid = !!error;
  const [show, setShow] = useState(false);
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>(mode === 'time' ? 'time' : 'date');
  
  const webInputRef = useRef<any>(null);

  const borderClass = isInvalid 
    ? 'border-status-error-text' 
    : 'border-transparent data-[focus=true]:border-border-focus';

  const opacityClass = disabled ? 'opacity-60 bg-[#F5F5F5]' : 'bg-bg-surface';

  const formatDisplay = (date?: Date | null) => {
    if (!date) return '';
    if (mode === 'date') {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (mode === 'time') {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getWebInputType = () => {
    if (mode === 'date') return 'date';
    if (mode === 'time') return 'time';
    return 'datetime-local';
  };

  const getWebInputValue = () => {
    if (!value) return '';
    const d = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    const iso = d.toISOString();
    if (mode === 'date') return iso.split('T')[0];
    if (mode === 'time') return iso.split('T')[1].slice(0, 5);
    return iso.slice(0, 16);
  };

  const handleWebChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    if (!val) return;
    
    if (mode === 'time') {
      const [hours, minutes] = val.split(':');
      const newDate = new Date();
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      if (onChange) onChange(newDate);
    } else {
      const newDate = new Date(val);
      if (onChange) onChange(newDate);
    }
  };

  const handleNativeChange = (event: any, selectedDate?: Date) => {
    if (disabled) {
      setShow(false);
      return;
    }
    if (Platform.OS === 'android') {
      if (mode === 'datetime') {
        if (currentMode === 'date') {
          setShow(false);
          if (event.type === 'set' && selectedDate) {
            if (onChange) onChange(selectedDate);
            setCurrentMode('time');
            setTimeout(() => setShow(true), 50);
          }
        } else {
          setShow(false);
          setCurrentMode('date');
          if (event.type === 'set' && selectedDate) {
            if (onChange) onChange(selectedDate);
          }
        }
      } else {
        setShow(false);
        if (event.type === 'set' && selectedDate) {
          if (onChange) onChange(selectedDate);
        }
      }
    } else {
      setShow(false);
      if (selectedDate && onChange) {
        onChange(selectedDate);
      }
    }
  };

  const handlePress = () => {
    if (disabled) return;
    setCurrentMode(mode === 'time' ? 'time' : 'date');
    setShow(true);
  };

  const openWebPicker = () => {
    if (disabled) return;
    if (Platform.OS === 'web' && webInputRef.current) {
      try {
        webInputRef.current.showPicker();
      } catch (e) {
        webInputRef.current.focus();
      }
    }
  };

  return (
    <FormControl isInvalid={isInvalid} className={`w-full ${className}`}>
      {label && (
        <FormControlLabel className="mb-1.5">
          <Text className="text-body-11-medium text-text-secondary">{label}</Text>
        </FormControlLabel>
      )}

      {Platform.OS === 'web' ? (
        <View className={`${opacityClass} h-[36px] px-3 rounded-lg flex-row items-center gap-1.5 border ${borderClass}`}>
          {LeftIcon && (
            <Pressable onPress={openWebPicker}>
              <LeftIcon className="text-text-secondary h-[18px] w-[18px]" />
            </Pressable>
          )}
          <input
            ref={webInputRef}
            type={getWebInputType()}
            value={getWebInputValue()}
            onChange={handleWebChange}
            disabled={disabled}
            className={`flex-1 bg-transparent border-0 outline-none p-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 ${disabled ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary'}`}
            style={{
              fontFamily: 'DMSans_400Regular, sans-serif',
              fontSize: '12px'
            }}
          />
          {RightIcon && (
            <Pressable onPress={openWebPicker}>
              <RightIcon className="text-text-secondary h-[18px] w-[18px]" />
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <Pressable 
            onPress={handlePress}
            className={`${opacityClass} h-[36px] px-3 rounded-lg flex-row items-center gap-1.5 border ${borderClass}`}
          >
            {LeftIcon && <LeftIcon className="text-text-secondary h-[18px] w-[18px]" />}
            <Text className={`flex-1 text-body-12-regular ${value ? (disabled ? 'text-text-secondary' : 'text-text-primary') : 'text-text-secondary'}`}>
              {value ? formatDisplay(value) : placeholder}
            </Text>
            {RightIcon && <RightIcon className="text-text-secondary h-[18px] w-[18px]" />}
          </Pressable>

          {show && !disabled && (
            <DateTimePicker
              value={value || new Date()}
              mode={Platform.OS === 'ios' ? (mode === 'datetime' ? 'datetime' : mode) : currentMode}
              display="default"
              onChange={handleNativeChange}
            />
          )}
        </>
      )}

      {error && (
        <View className="mt-1 flex-row items-center gap-1">
          <AlertCircle className="text-status-error-text h-[14px] w-[14px]" />
          <Text className="text-body-11-regular text-status-error-text">{error}</Text>
        </View>
      )}
    </FormControl>
  );
}
