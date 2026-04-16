import React from 'react';
import { Switch } from '@/src/components/ui/switch';

// Projedeki global.css içerisinde tanımlı olan marka renk hex kodları
const ACTIVE_TRACK_COLOR = '#E4F2D3'; // var(--color-light-green)
const INACTIVE_TRACK_COLOR = '#E5E6E6'; // var(--color-semi-subtle-grey)
const ACTIVE_THUMB_COLOR = '#35BFA3'; // var(--color-green)
const INACTIVE_THUMB_COLOR = '#FFFFFF'; // var(--color-white)

export interface AppSwitchProps {
  /** Switch'in açık/kapalı durumu */
  value: boolean;
  /** Değer değiştiğinde tetiklenecek fonksiyon */
  onToggle: (val: boolean) => void;
  /** Switch'in pasif (tıklanamaz) durumu */
  isDisabled?: boolean;
  /** Boyut seçeneği (sm, md, lg) */
  size?: 'sm' | 'md' | 'lg';
}

export function AppSwitch({
  value,
  onToggle,
  isDisabled = false,
  size = 'md',
}: AppSwitchProps) {
  return (
    <Switch
      size={size}
      value={value}
      onValueChange={onToggle}
      isDisabled={isDisabled}
      disabled={isDisabled}
      trackColor={{
        false: INACTIVE_TRACK_COLOR,
        true: ACTIVE_TRACK_COLOR,
      }}
      thumbColor={value ? ACTIVE_THUMB_COLOR : INACTIVE_THUMB_COLOR}
      ios_backgroundColor={INACTIVE_TRACK_COLOR}
    />
  );
}
