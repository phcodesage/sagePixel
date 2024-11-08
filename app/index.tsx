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
import WelcomeLoader from './components/WelcomeLoader';

const { width } = Dimensions.get('window');

const SUGGESTIONS = [
  'Nature', 'City', 'Animals', 'Space', 'Ocean', 'Mountains', 'Flowers', 
  'Cars', 'Architecture', 'Food', 'Art', 'Technology', 'People', 'Travel', 'Music'
];

export default function Home() {
  const [images, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progressiveLoading, setProgressiveLoading] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  const loadImages = async (query = '', currentPage = 1) => {
    if (currentPage === 1) {
      setLoading(true);
      setImages([]);
    } else {
      setProgressiveLoading(true);
    }
    setError(null);
    
    try {
      const { photos, totalResults } = await fetchAllPhotos(query, currentPage);
      
      if (currentPage === 1) {
        setImages(photos);
      } else {
        setImages(prev => [...prev, ...photos]);
      }
      setTotalResults(totalResults);
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images. Please try again.');
      if (currentPage === 1) {
        setImages([]);
      }
      setTotalResults(0);
    } finally {
      setLoading(false);
      setProgressiveLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadImages('', 1);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== '') {
      loadImages(debouncedSearchQuery, 1);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (images.length < totalResults) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadImages(searchQuery, nextPage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadImages(searchQuery, 1);
    setRefreshing(false);
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
          source={{ uri: item.src.small }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={item.blur_hash}
          cachePolicy="memory-disk"
        />
        <View style={styles.sourceTag}>
          <Text style={styles.sourceText}>{item.source}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  const renderFooter = () => {
    if (!progressiveLoading) return null;
    return (
      <View style={styles.loaderFooter}>
        <SkeletonLoader count={2} />
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => loadImages(searchQuery, page)}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!welcomeComplete ? (
        <WelcomeLoader 
          imagesLoaded={!loading}
          totalImages={images.length}
          onLoadingComplete={() => setWelcomeComplete(true)}
        />
      ) : (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search wallpapers..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
              {SUGGESTIONS.map((suggestion) => (
                <TouchableOpacity 
                  key={suggestion} 
                  style={[
                    styles.suggestionButton,
                    searchQuery === suggestion && styles.activeSuggestion
                  ]} 
                  onPress={() => handleSearch(suggestion)}
                >
                  <Text style={[
                    styles.suggestionText,
                    searchQuery === suggestion && styles.activeSuggestionText
                  ]}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.resultsText}>
              {loading ? 'Searching...' : `${totalResults} results found`}
            </Text>
          </View>

          {error ? (
            renderError()
          ) : loading && page === 1 ? (
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
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              initialNumToRender={4}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: (width - 30) / 2,
                offset: ((width - 30) / 2) * Math.floor(index / 2),
                index,
              })}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </>
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
  resultsText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 10,
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
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  activeSuggestion: {
    backgroundColor: '#007AFF',
  },
  activeSuggestionText: {
    color: '#fff',
  },
  loaderFooter: {
    paddingVertical: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
}); 