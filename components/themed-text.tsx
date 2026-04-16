import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  let typeClasses = '';
  if (type === 'default') typeClasses = 'text-base leading-6';
  else if (type === 'defaultSemiBold') typeClasses = 'text-base leading-6 font-semibold';
  else if (type === 'title') typeClasses = 'text-[32px] font-bold leading-[32px]';
  else if (type === 'subtitle') typeClasses = 'text-[20px] font-bold';
  else if (type === 'link') typeClasses = 'text-base leading-[30px]';

  return (
    <Text
      style={[{ color }, style]}
      className={`${typeClasses} ${className || ''}`}
      {...rest}
    />
  );
}
