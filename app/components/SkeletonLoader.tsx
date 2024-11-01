import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SKELETON_COUNT = 8;

export default function SkeletonLoader() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => {
      pulseAnim.setValue(0);
    };
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonItems = () => {
    const items = [];
    for (let i = 0; i < SKELETON_COUNT; i++) {
      items.push(
        <Animated.View
          key={i}
          style={[
            styles.skeletonItem,
            {
              opacity,
            },
          ]}
        />
      );
    }
    return items;
  };

  return (
    <View style={styles.container}>
      {renderSkeletonItems()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  skeletonItem: {
    width: (width - 30) / 2,
    height: (width - 30) / 2,
    margin: 5,
    backgroundColor: '#333',
    borderRadius: 15,
  },
}); 