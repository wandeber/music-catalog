import axios from 'axios';
import type { MusicBrainzArtist, MusicBrainzAlbum } from '../types/api';
import { getFromCache, setInCache } from '@/lib/redis';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const HEADERS = {
  'User-Agent': 'MusicCatalog/1.0.0 (https://github.com/yourusername/music-catalog)',
};

// Añadir un pequeño delay entre peticiones para respetar el rate limit
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Tiempos de caché específicos (en segundos)
const CACHE_TIMES = {
  SEARCH: 7 * 24 * 60 * 60,    // 7 días para búsquedas
  ARTIST: 7 * 24 * 60 * 60,    // 7 días para detalles de artista
  RELEASES: 7 * 24 * 60 * 60,  // 7 días para releases
};

export const musicBrainzApi = {
  searchArtists: async (query: string): Promise<MusicBrainzArtist[]> => {
    const cacheKey = `search:artists:${query}`;
    
    // Intentar obtener del caché
    const cached = await getFromCache<MusicBrainzArtist[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BASE_URL}/artist`, {
        headers: HEADERS,
        params: {
          query,
          fmt: 'json',
          limit: 10,
        },
      });

      const artists = response.data.artists || [];
      
      // Guardar en caché
      await setInCache(cacheKey, artists, CACHE_TIMES.SEARCH);
      
      return artists;
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  },

  getArtist: async (id: string): Promise<MusicBrainzArtist | null> => {
    const cacheKey = `artist:${id}`;
    
    // Intentar obtener del caché
    const cached = await getFromCache<MusicBrainzArtist>(cacheKey);
    if (cached) return cached;

    try {
      await delay(1000);
      const response = await axios.get(`${BASE_URL}/artist/${id}`, {
        headers: HEADERS,
        params: {
          fmt: 'json',
          inc: 'tags+ratings',
        },
      });
      
      if (!response.data || !response.data.name) {
        return null;
      }

      const artist = {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        country: response.data.country,
        'life-span': response.data['life-span'] || {},
        tags: response.data.tags || [],
      };

      // Guardar en caché
      await setInCache(cacheKey, artist, CACHE_TIMES.ARTIST);
      
      return artist;
    } catch (error) {
      console.error('Error getting artist:', error);
      return null;
    }
  },

  getArtistReleases: async (id: string): Promise<MusicBrainzAlbum[]> => {
    const cacheKey = `artist:${id}:releases`;
    
    // Intentar obtener del caché
    const cached = await getFromCache<MusicBrainzAlbum[]>(cacheKey);
    if (cached) return cached;

    try {
      await delay(1000);
      const response = await axios.get(`${BASE_URL}/release-group`, {
        headers: HEADERS,
        params: {
          artist: id,
          fmt: 'json',
          limit: 100,
          offset: 0,
        },
      });

      const releaseGroups = response.data['release-groups'] || [];
      
      const releases = releaseGroups
        .sort((a: MusicBrainzAlbum, b: MusicBrainzAlbum) => {
          const dateA = a['first-release-date'] || '';
          const dateB = b['first-release-date'] || '';
          return dateB.localeCompare(dateA);
        })
        .map((group: any) => ({
          id: group.id,
          title: group.title,
          'first-release-date': group['first-release-date'],
          'release-group': {
            'primary-type': group['primary-type'],
            'secondary-types': group['secondary-types'] || [],
          },
          'artist-credit': group['artist-credit']?.[0]?.name || '',
          releases: 1,
          type: group['primary-type'] || 'Álbum',
        }));

      // Guardar en caché
      await setInCache(cacheKey, releases, CACHE_TIMES.RELEASES);
      
      return releases;
    } catch (error) {
      console.error('Error getting artist releases:', error);
      return [];
    }
  },

  getReleaseGroupDetails: async (id: string): Promise<any> => {
    const cacheKey = `release:${id}`;
    
    // Intentar obtener del caché
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await delay(1000);
      
      // Primero obtenemos los detalles del grupo de lanzamientos
      const groupResponse = await axios.get(`${BASE_URL}/release-group/${id}`, {
        headers: HEADERS,
        params: {
          fmt: 'json',
          inc: 'artist-credits+releases',
        },
      });

      if (!groupResponse.data) {
        return null;
      }

      await delay(1000);

      // Obtenemos los detalles del primer lanzamiento
      const firstReleaseId = groupResponse.data.releases?.[0]?.id;
      if (!firstReleaseId) {
        const data = {
          ...groupResponse.data,
          releases: [],
        };
        await setInCache(cacheKey, data, CACHE_TIMES.RELEASES);
        return data;
      }

      const releaseResponse = await axios.get(`${BASE_URL}/release/${firstReleaseId}`, {
        headers: HEADERS,
        params: {
          fmt: 'json',
          inc: 'recordings+media+artist-credits',
        },
      });

      const data = {
        ...groupResponse.data,
        releases: [
          {
            ...releaseResponse.data,
            media: releaseResponse.data.media?.map((medium: any) => ({
              ...medium,
              tracks: medium.tracks?.map((track: any) => ({
                id: track.id,
                number: track.number,
                title: track.title,
                length: track.recording?.length,
                'artist-credit': track['artist-credit']?.[0]?.name,
              })),
            })),
          },
        ],
      };

      // Guardar en caché
      await setInCache(cacheKey, data, CACHE_TIMES.RELEASES);
      
      return data;
    } catch (error) {
      console.error('Error getting release group details:', error);
      return null;
    }
  },
}; 