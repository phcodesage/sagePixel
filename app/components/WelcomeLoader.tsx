import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';

interface WelcomeLoaderProps {
  imagesLoaded: boolean;
  totalImages: number;
  onLoadingComplete: () => void;
}

export default function WelcomeLoader({ imagesLoaded, totalImages, onLoadingComplete }: WelcomeLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Checking connection...');
  const progressAnim = new Animated.Value(0);
  const [canComplete, setCanComplete] = useState(false);

  useEffect(() => {
    if (imagesLoaded && totalImages > 0 && canComplete) {
      onLoadingComplete();
    }
  }, [imagesLoaded, totalImages, canComplete]);

  useEffect(() => {
    const loadingTexts = [
      'Checking connection...',
      'Loading resources...',
      'Fetching wallpapers...',
      'Preparing your experience...',
    ];

    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 2000);

    // Start progress animation
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const nextProgress = Math.min(prev + 1, 100);
        
        // If we reach 100% and images are loaded, mark as complete
        if (nextProgress >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setCanComplete(true);
        }
        
        // If images aren't loaded yet, stay at 95%
        if (nextProgress >= 95 && (!imagesLoaded || totalImages === 0)) {
          return 95;
        }
        
        return nextProgress;
      });
    }, 20);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Don't show percentage if complete
  const showPercentage = !(imagesLoaded && totalImages > 0 && progress >= 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SagePixel</Text>
      <Text style={styles.subtitle}>Discover Amazing Wallpapers</Text>
      
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width,
            },
          ]} 
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentage}>
          {progress}%
        </Text>
      )}
      
      <Text style={styles.loadingText}>
        {!imagesLoaded ? loadingText : 
         totalImages === 0 ? 'No wallpapers found. Retrying...' :
         'Loading complete!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 50,
  },
  progressContainer: {
    width: '80%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  percentage: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
}); 