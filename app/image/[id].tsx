import { useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import PulseLoader from '../components/PulseLoader';

const { width } = Dimensions.get('window');

export default function ImageDetail() {
  const { url, title } = useLocalSearchParams();
  const imageUrl = Array.isArray(url) ? url[0] : url;
  const imageTitle = Array.isArray(title) ? title[0] : title || 'Wallpaper';
  const [downloading, setDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const downloadImage = async () => {
    try {
      setDownloading(true);
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images');
        return;
      }

      const filename = `wallpaper-${Date.now()}.jpg`;
      const result = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      await MediaLibrary.saveToLibraryAsync(result.uri);
      
      Alert.alert(
        'Success', 
        Platform.OS === 'android' 
          ? 'Image saved to gallery! You can set it as wallpaper from your gallery.'
          : 'Image saved to gallery!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download image');
    } finally {
      setDownloading(false);
      toggleExpand();
    }
  };

  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const opacity = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <Stack.Screen 
        options={{
          title: imageTitle,
          headerTitleStyle: {
            fontSize: 16,
            fontFamily: 'Inter-Medium',
          }
        }} 
      />
      <View style={styles.container}>
        {!imageLoaded && <PulseLoader />}
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            !imageLoaded && styles.hiddenImage
          ]}
          contentFit="cover"
          onLoadEnd={() => setImageLoaded(true)}
        />
        
        <View style={styles.fabContainer}>
          <Animated.View style={[
            styles.actionButton,
            { transform: [{ translateY }], opacity }
          ]}>
            <TouchableOpacity 
              style={styles.actionButtonInner}
              onPress={downloadImage}
              disabled={downloading || !imageLoaded}
            >
              <Ionicons name="download-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity 
            style={[
              styles.fab,
              isExpanded && styles.fabActive
            ]}
            onPress={toggleExpand}
            disabled={!imageLoaded}
          >
            <Ionicons 
              name={isExpanded ? "close" : "menu"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  image: {
    flex: 1,
  },
  hiddenImage: {
    opacity: 0,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabActive: {
    backgroundColor: '#FF3B30',
  },
  actionButton: {
    marginBottom: 16,
  },
  actionButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 