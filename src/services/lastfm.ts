import axios from 'axios';
import type { LastFmArtist } from '../types/api';

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export const lastFmApi = {
  getArtistInfo: async (
    artist: string,
    mbid?: string
  ): Promise<LastFmArtist | null> => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          method: 'artist.getInfo',
          artist: artist,
          mbid: mbid,
          api_key: API_KEY,
          format: 'json',
        },
      });
      return response.data.artist;
    } catch (error) {
      console.error('Error getting artist info from Last.fm:', error);
      return null;
    }
  },

  getSimilarArtists: async (
    artist: string,
    limit = 5
  ): Promise<LastFmArtist[]> => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          method: 'artist.getSimilar',
          artist: artist,
          limit: limit,
          api_key: API_KEY,
          format: 'json',
        },
      });
      return response.data.similarartists.artist;
    } catch (error) {
      console.error('Error getting similar artists from Last.fm:', error);
      return [];
    }
  },

  getTopTracks: async (artist: string, limit = 10) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          method: 'artist.getTopTracks',
          artist: artist,
          limit: limit,
          api_key: API_KEY,
          format: 'json',
        },
      });
      return response.data.toptracks.track;
    } catch (error) {
      console.error('Error getting top tracks from Last.fm:', error);
      return [];
    }
  },
}; 