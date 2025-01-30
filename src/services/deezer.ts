import axios from 'axios';
import type { DeezerArtist, DeezerTrack } from '../types/api';

const BASE_URL = 'https://api.deezer.com';

export const deezerApi = {
  searchArtists: async (query: string): Promise<DeezerArtist[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/search/artist`, {
        params: {
          q: query,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching artists on Deezer:', error);
      return [];
    }
  },

  getArtistTopTracks: async (
    artistId: number,
    limit = 10
  ): Promise<DeezerTrack[]> => {
    try {
      const response = await axios.get(
        `${BASE_URL}/artist/${artistId}/top?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error getting artist top tracks from Deezer:', error);
      return [];
    }
  },

  getTrackPreview: async (trackId: number): Promise<string | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/track/${trackId}`);
      return response.data.preview;
    } catch (error) {
      console.error('Error getting track preview from Deezer:', error);
      return null;
    }
  },
}; 