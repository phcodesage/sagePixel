import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { fetchAllPhotos, Photo } from './services/api';
import SkeletonLoader from './components/SkeletonLoader';

const { width } = Dimensions.get('window');

const SUGGESTIONS = [
  'Nature', 'City', 'Animals', 'Space', 'Ocean', 'Mountains', 'Flowers', 
  'Cars', 'Architecture', 'Food', 'Art', 'Technology', 'People', 'Travel', 'Music'
];

export default function Home() {
  const [images, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadImages = async (query = '') => {
    setLoading(true);
    try {
      const photos = await fetchAllPhotos(query);
      setImages(photos);
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadImages(query);
  };

  const renderItem = ({ item }: { item: Photo }) => (
    <Link 
      href={{
        pathname: '/image/[id]',
        params: { 
          id: item.id, 
          url: item.src.original,
          source: item.source,
          title: item.title || `${item.source} Wallpaper`
        }
      }}
      asChild
    >
      <TouchableOpacity style={styles.imageContainer}>
        <Image
          source={{ uri: item.src.medium }}
          style={styles.image}
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.sourceTag}>
          <Text style={styles.sourceText}>{item.source}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search wallpapers..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
          {SUGGESTIONS.map((suggestion) => (
            <TouchableOpacity 
              key={suggestion} 
              style={styles.suggestionButton} 
              onPress={() => handleSearch(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : images.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No images found</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.source}-${item.id}`}
          numColumns={2}
          contentContainerStyle={styles.imageGrid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionButton: {
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGrid: {
    padding: 5,
  },
  imageContainer: {
    flex: 1,
    margin: 5,
  },
  image: {
    width: (width - 30) / 2,
    height: (width - 30) / 2,
    borderRadius: 15,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  sourceTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
}); 