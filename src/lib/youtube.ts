const API_KEY = 'AIzaSyAld-Dq-5ulLHHVv5UoLj5KHxJxasQ4GtA';

export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  playlistId: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  thumbnail: string;
  itemCount: number;
  items?: PlaylistItem[];
}

export async function fetchPlaylistInfo(playlistId: string): Promise<PlaylistInfo> {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Playlist not found or is private.');
  }

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
    itemCount: item.contentDetails.itemCount,
  };
}

export async function fetchPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  let items: PlaylistItem[] = [];
  let pageToken = '';
  const maxPages = 20; // Limit to 1000 videos per playlist to avoid API quota exhaustion
  let pages = 0;

  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const fetchedItems = data.items
        .filter((item: any) => 
          item.snippet.title !== 'Private video' && 
          item.snippet.title !== 'Deleted video' &&
          item.snippet.resourceId?.videoId
        )
        .map((item: any) => ({
          id: item.id,
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle || 'Unknown Channel',
          playlistId: playlistId
        }));

      items = [...items, ...fetchedItems];
      pageToken = data.nextPageToken;
      pages++;
    } while (pageToken && pages < maxPages);

    return items;
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    throw error;
  }
}

export function extractPlaylistId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  
  // If it's already just an ID (typically 34 chars for PL..., or 18+ for others)
  if (/^[a-zA-Z0-9_-]{12,}$/.test(urlOrId) && !urlOrId.includes('http')) {
    return urlOrId;
  }

  const match = urlOrId.match(/[&?]list=([^&]+)/i);
  return match ? match[1] : null;
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
