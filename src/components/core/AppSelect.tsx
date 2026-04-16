import React from 'react';
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
  SelectItemText,
} from './select';
import { ChevronDown } from 'lucide-react-native';

export interface AppSelectProps {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  isDisabled?: boolean;
}

export function AppSelect({
  options,
  placeholder,
  selectedValue,
  onValueChange,
  isDisabled = false,
}: AppSelectProps) {
  return (
    <Select
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      isDisabled={isDisabled}
    >
      <SelectTrigger
        variant="outline"
        className="bg-bg-surface px-3 h-[36px] min-h-[36px] rounded-lg border-transparent data-[focus=true]:border-border-focus flex-row items-center gap-1.5 justify-between w-full"
      >
        <SelectInput
          placeholder={placeholder}
          className="flex-1 text-body-14-regular !text-text-secondary p-0 web:outline-none placeholder:!text-text-secondary bg-transparent"
          style={{ fontFamily: 'DMSans_400Regular' }}
        />
        <SelectIcon as={ChevronDown} className="text-slate-500 h-[18px] w-[18px] ml-2" />
      </SelectTrigger>
      
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent className="bg-white rounded-t-xl shadow-md pb-6 md:rounded-xl md:border md:border-slate-100">
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              label={option.label}
              value={option.value}
              className="data-[focus=true]:bg-slate-50 px-4 py-3 border-b border-slate-50 last:border-b-0"
            >
              <SelectItemText 
                className="text-body-12-regular !text-text-secondary w-full"
                style={{ fontFamily: 'DMSans_400Regular' }}
              >
                {option.label}
              </SelectItemText>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
