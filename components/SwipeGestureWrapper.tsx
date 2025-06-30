import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAppContext } from '@/context/AppContext';

interface SwipeGestureWrapperProps {
  children: ReactNode;
}

export function SwipeGestureWrapper({ children }: SwipeGestureWrapperProps) {
  const { openProfileDrawer, openMessagesDrawer } = useAppContext();

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onEnd((event) => {
      if (event.translationX > 50 && Math.abs(event.velocityX) > 500) {
        openProfileDrawer();
      } else if (event.translationX < -50 && Math.abs(event.velocityX) > 500) {
        openMessagesDrawer();
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});