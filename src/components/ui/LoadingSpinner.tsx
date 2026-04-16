import { View, Text, ViewStyle } from 'react-native';
import { Spinner } from '@/src/components/ui/spinner';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  color?: string;
  className?: string;
  style?: ViewStyle | any;
}

export const LoadingSpinner = ({ size = 'small', text, color, className, style }: LoadingSpinnerProps) => {
  return (
    <View className={`flex-1 justify-center items-center ${className || ''}`} style={style}>
      <Spinner size={size} color={color} />
      {text && <Text className="mt-2 text-gray-600 dark:text-gray-300">{text}</Text>}
    </View>
  );
};
