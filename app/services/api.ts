const PEXELS_API_KEY = 'D4NJWR3jmDAy0LS3KQm2Q19KzhDJQ7htiTSGHyyOU1ZJn8ywjrKXiD4T';
const UNSPLASH_API_KEY = 'YOUR_UNSPLASH_API_KEY';

export interface Photo {
  id: string | number;
  src: {
    original: string;
    medium: string;
  };
  source: 'pexels' | 'unsplash';
  title?: string;
}

async function fetchPexelsPhotos(query = ''): Promise<Photo[]> {
  try {
    const endpoint = query 
      ? `https://api.pexels.com/v1/search?query=${query}&per_page=40`
      : 'https://api.pexels.com/v1/curated?per_page=40';

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    const data = await response.json();
    
    // Check if photos exist in the response
    if (!data.photos || !Array.isArray(data.photos)) {
      console.log('Pexels API response:', data);
      return [];
    }

    return data.photos.map((photo: any) => ({
      id: photo.id,
      src: {
        original: photo.src.original,
        medium: photo.src.medium
      },
      source: 'pexels' as const,
      title: photo.alt || 'Pexels Wallpaper'
    }));
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return [];
  }
}

async function fetchUnsplashPhotos(query = ''): Promise<Photo[]> {
  try {
    const endpoint = query 
      ? `https://api.unsplash.com/search/photos?query=${query}&per_page=40`
      : 'https://api.unsplash.com/photos/random?count=40';

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
      }
    });

    const data = await response.json();
    
    // For now, let's just use Pexels until we get Unsplash API key
    return [];

    // Uncomment this when you have Unsplash API key
    /*
    const photos = query ? data.results : data;
    
    if (!photos || !Array.isArray(photos)) {
      console.log('Unsplash API response:', data);
      return [];
    }

    return photos.map((photo: any) => ({
      id: photo.id,
      src: {
        original: photo.urls.full,
        medium: photo.urls.regular
      },
      source: 'unsplash' as const
    }));
    */
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return [];
  }
}

export async function fetchAllPhotos(query = ''): Promise<Photo[]> {
  try {
    // For now, just fetch from Pexels since we don't have Unsplash API key
    const pexelsPhotos = await fetchPexelsPhotos(query);
    return pexelsPhotos;

    // Uncomment this when you have Unsplash API key
    /*
    const [pexelsPhotos, unsplashPhotos] = await Promise.all([
      fetchPexelsPhotos(query),
      fetchUnsplashPhotos(query)
    ]);

    // Combine and shuffle the results
    const allPhotos = [...pexelsPhotos, ...unsplashPhotos];
    return allPhotos.sort(() => Math.random() - 0.5);
    */
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
} 