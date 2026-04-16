import React, { useState } from 'react';
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from '@/src/components/ui/checkbox';
import { Check, Minus } from 'lucide-react-native';

export interface AppCheckboxProps {
  label?: string;
  value: string;
  isChecked?: boolean;
  defaultIsChecked?: boolean;
  isIndeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (isSelected: boolean) => void;
  className?: string; // Container className
}

const SIZE_MAPS = {
    sm: { indicator: '!size-3 !rounded-sm !border', icon: '!size-2', label: '!text-body-12-regular text-text-primary ml-1.5' },
    md: { indicator: '!size-4 !rounded !border-2', icon: '!size-2.5', label: '!text-body-14-medium text-text-primary ml-2' },
    lg: { indicator: '!w-[22px] !h-[22px] !rounded-md !border-2', icon: '!size-3.5', label: '!text-body-16-regular text-text-primary ml-2' }
};

export const AppCheckbox = ({
  label,
  value,
  isChecked: propIsChecked,
  defaultIsChecked = false,
  isIndeterminate = false,
  size = 'md',
  onChange,
  className = '',
}: AppCheckboxProps) => {

  const [internalChecked, setInternalChecked] = useState(defaultIsChecked);
  
  const isControlled = propIsChecked !== undefined;
  const isActuallyChecked = isControlled ? propIsChecked : internalChecked;

  const handleChange = (val: boolean) => {
    if (!isControlled) {
      setInternalChecked(val);
    }
    if (onChange) onChange(val);
  };

  const sizeMap = SIZE_MAPS[size];

  // We rely fully on the NativeWind framework for the checked visual changes by using 'data-[checked=true]'.
  const stateClass = isIndeterminate
    ? 'bg-brand-primary border-brand-primary data-[hover=true]:bg-brand-primary data-[hover=true]:border-brand-primary' // Strict override when indeterminate
    : 'bg-bg-surface border-border-default data-[hover=true]:bg-bg-surface data-[hover=true]:border-brand-primary data-[checked=true]:bg-brand-primary data-[checked=true]:border-brand-primary data-[hover=true]:data-[checked=true]:bg-brand-primary data-[hover=true]:data-[checked=true]:border-brand-primary';

  return (
    <Checkbox
      value={value}
      isChecked={isActuallyChecked || isIndeterminate}
      onChange={handleChange}
      className={`flex-row items-center justify-start ${className}`}
    >
      <CheckboxIndicator className={`${sizeMap.indicator} items-center justify-center ${stateClass}`}>
         {/* We only force CheckboxIcon to show when indeterminate bypasses the strict isChecked logic of Gluestack */}
         <CheckboxIcon 
           as={isIndeterminate ? Minus : Check}
           className={`${sizeMap.icon} text-white fill-none ${isIndeterminate ? 'opacity-100' : ''}`}
         />
      </CheckboxIndicator>
      {label && <CheckboxLabel className={`${sizeMap.label}`}>{label}</CheckboxLabel>}
    </Checkbox>
  );
};

AppCheckbox.displayName = 'AppCheckbox';
