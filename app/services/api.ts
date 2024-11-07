const PEXELS_API_KEY = 'D4NJWR3jmDAy0LS3KQm2Q19KzhDJQ7htiTSGHyyOU1ZJn8ywjrKXiD4T';

export interface Photo {
  id: string | number;
  src: {
    original: string;
    medium: string;
  };
  source: 'pexels' | 'unsplash';
  title?: string;
}

async function fetchPexelsPhotos(query = '', page = 1): Promise<{ photos: Photo[], totalResults: number }> {
  try {
    const endpoint = query 
      ? `https://api.pexels.com/v1/search?query=${query}&per_page=40&page=${page}`
      : `https://api.pexels.com/v1/curated?per_page=40&page=${page}`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    const data = await response.json();
    
    if (!data.photos || !Array.isArray(data.photos)) {
      console.log('Pexels API response:', data);
      return { photos: [], totalResults: 0 };
    }

    const photos = data.photos.map((photo: any) => ({
      id: photo.id,
      src: {
        original: photo.src.original,
        medium: photo.src.medium
      },
      source: 'pexels' as const,
      title: photo.alt || 'Pexels Wallpaper'
    }));

    return { photos, totalResults: data.total_results };
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return { photos: [], totalResults: 0 };
  }
}

export async function fetchAllPhotos(query = '', page = 1): Promise<{ photos: Photo[], totalResults: number }> {
  try {
    const pexelsData = await fetchPexelsPhotos(query, page);
    return pexelsData;
  } catch (error) {
    console.error('Error fetching photos:', error);
    return { photos: [], totalResults: 0 };
  }
} 