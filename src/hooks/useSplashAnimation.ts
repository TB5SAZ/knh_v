import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolate, withDelay, cancelAnimation } from 'react-native-reanimated';

const SPLASH_DURATION = 3000;

export function useSplashAnimation(isDesktop: boolean, windowHeight: number) {
  const splashProgress = useSharedValue(0);
  const formOpacityProgress = useSharedValue(0);
  
  const [showSpinner, setShowSpinner] = useState(true);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
      splashProgress.value = withTiming(1, { duration: 800 }, () => {
        runOnJS(setIsSplashComplete)(true);
      });
      // 400ms after panel starts moving, form slowly fades in
      formOpacityProgress.value = withDelay(400, withTiming(1, { duration: 800 }));
    }, SPLASH_DURATION);
    
    return () => {
      clearTimeout(timer);
      cancelAnimation(splashProgress);
      cancelAnimation(formOpacityProgress);
    };
  }, [splashProgress, formOpacityProgress]);

  const greenPanelStyle = useAnimatedStyle(() => {
    if (isDesktop) {
      return {
        width: `${interpolate(splashProgress.value, [0, 1], [100, 50])}%`,
        height: '100%',
        overflow: 'hidden',
        zIndex: 50,
      };
    } else {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        transform: [{
          translateY: interpolate(splashProgress.value, [0, 1], [0, -windowHeight])
        }],
        zIndex: 50,
      };
    }
  }, [isDesktop, windowHeight]);

  const rightPanelStyle = useAnimatedStyle(() => {
    if (isDesktop) {
      return {
        width: `${interpolate(splashProgress.value, [0, 1], [0, 50])}%`,
        opacity: formOpacityProgress.value,
        overflow: 'hidden',
      };
    } else {
      return {
        flex: 1,
        width: '100%',
        opacity: formOpacityProgress.value,
      };
    }
  }, [isDesktop]);

  return {
    showSpinner,
    isSplashComplete,
    greenPanelStyle,
    rightPanelStyle
  };
}
