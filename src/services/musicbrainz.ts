import axios from 'axios';
import type { MusicBrainzArtist, MusicBrainzAlbum } from '../types/api';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const HEADERS = {
  'User-Agent': 'MusicCatalog/1.0.0 (https://github.com/yourusername/music-catalog)',
};

export const musicBrainzApi = {
  searchArtists: async (query: string): Promise<MusicBrainzArtist[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/artist`, {
        headers: HEADERS,
        params: {
          query,
          fmt: 'json',
        },
      });
      return response.data.artists || [];
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  },

  getArtist: async (id: string): Promise<MusicBrainzArtist | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/artist/${id}`, {
        headers: HEADERS,
        params: {
          fmt: 'json',
          inc: 'tags+ratings+releases',
        },
      });
      
      // Asegurarnos de que tenemos los datos necesarios
      if (!response.data || !response.data.name) {
        return null;
      }

      return {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        country: response.data.country,
        'life-span': response.data['life-span'] || {},
        tags: response.data.tags || [],
      };
    } catch (error) {
      console.error('Error getting artist:', error);
      return null;
    }
  },

  getArtistReleases: async (id: string): Promise<MusicBrainzAlbum[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/release-group`, {
        headers: HEADERS,
        params: {
          artist: id,
          fmt: 'json',
          limit: 100,
        },
      });
      return response.data['release-groups'] || [];
    } catch (error) {
      console.error('Error getting artist releases:', error);
      return [];
    }
  },
}; 