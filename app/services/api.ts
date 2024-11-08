const PEXELS_API_KEY = 'D4NJWR3jmDAy0LS3KQm2Q19KzhDJQ7htiTSGHyyOU1ZJn8ywjrKXiD4T';

export interface Photo {
  id: string | number;
  src: {
    original: string;
    medium: string;
    small: string;
  };
  source: 'pexels' | 'unsplash';
  title?: string;
  blur_hash?: string;
}

async function fetchPexelsPhotos(query = '', page = 1): Promise<{ photos: Photo[], totalResults: number }> {
  try {
    const endpoint = query 
      ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&page=${page}`
      : `https://api.pexels.com/v1/curated?per_page=20&page=${page}`;

    console.log('Fetching from endpoint:', endpoint);

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      console.error('API Error:', response.status, await response.text());
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    console.log('API Response:', {
      total_results: data.total_results,
      photos_count: data.photos?.length
    });

    if (!data.photos || !Array.isArray(data.photos)) {
      console.error('Invalid API response format:', data);
      return { photos: [], totalResults: 0 };
    }

    const photos = data.photos.map((photo: any) => ({
      id: photo.id,
      src: {
        original: photo.src.original,
        medium: photo.src.medium,
        small: photo.src.small
      },
      source: 'pexels' as const,
      title: photo.alt || 'Pexels Wallpaper'
    }));

    return { 
      photos, 
      totalResults: data.total_results || 0 
    };
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    throw error;
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