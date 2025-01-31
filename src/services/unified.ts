import { musicBrainzApi } from './musicbrainz';
import { lastFmApi } from './lastfm';
import { deezerApi } from './deezer';
import type { UnifiedArtist, UnifiedTrack } from '../types/api';

export const unifiedApi = {
  searchArtists: async (query: string): Promise<UnifiedArtist[]> => {
    // Primero buscamos en MusicBrainz para obtener los datos base
    const mbArtists = await musicBrainzApi.searchArtists(query);
    
    // Procesamos cada artista en paralelo
    const unifiedArtists = await Promise.all(
      mbArtists.slice(0, 5).map(async (mbArtist) => {
        // Obtenemos información adicional de Last.fm
        const lastFmInfo = await lastFmApi.getArtistInfo(mbArtist.name, mbArtist.id);
        
        // Buscamos en Deezer para obtener imágenes de mejor calidad
        const deezerResults = await deezerApi.searchArtists(mbArtist.name);
        const deezerArtist = deezerResults[0];

        return {
          id: mbArtist.id,
          name: mbArtist.name,
          images: {
            small: deezerArtist?.picture_small || lastFmInfo?.image[0]?.['#text'],
            medium: deezerArtist?.picture_medium || lastFmInfo?.image[2]?.['#text'],
            large: deezerArtist?.picture_big || lastFmInfo?.image[3]?.['#text'],
          },
          biography: lastFmInfo?.bio?.summary,
          country: mbArtist.country,
          tags: [
            ...(mbArtist.tags?.map(tag => tag.name) || []),
            ...(lastFmInfo?.tags?.tag.map(tag => tag.name) || [])
          ],
          yearFormed: mbArtist['life-span']?.begin,
          yearDisbanded: mbArtist['life-span']?.end,
        };
      })
    );

    return unifiedArtists;
  },

  getArtistDetails: async (id: string): Promise<UnifiedArtist | null> => {
    const mbArtist = await musicBrainzApi.getArtist(id);
    if (!mbArtist) return null;

    const lastFmInfo = await lastFmApi.getArtistInfo(mbArtist.name, id);
    const deezerResults = await deezerApi.searchArtists(mbArtist.name);
    const deezerArtist = deezerResults[0];

    // Obtenemos artistas similares de Last.fm
    const similarArtists = await lastFmApi.getSimilarArtists(mbArtist.name);

    return {
      id: mbArtist.id,
      name: mbArtist.name,
      images: {
        small: deezerArtist?.picture_small || lastFmInfo?.image[0]?.['#text'],
        medium: deezerArtist?.picture_medium || lastFmInfo?.image[2]?.['#text'],
        large: deezerArtist?.picture_big || lastFmInfo?.image[3]?.['#text'],
      },
      biography: lastFmInfo?.bio?.content,
      country: mbArtist.country,
      tags: [
        ...(mbArtist.tags?.map(tag => tag.name) || []),
        ...(lastFmInfo?.tags?.tag.map(tag => tag.name) || [])
      ],
      yearFormed: mbArtist['life-span']?.begin,
      yearDisbanded: mbArtist['life-span']?.end,
      similar: similarArtists.map(artist => ({
        id: artist.mbid || '',
        name: artist.name,
        images: {
          small: artist.image[0]?.['#text'],
          medium: artist.image[2]?.['#text'],
          large: artist.image[3]?.['#text'],
        },
        tags: [],
      })),
    };
  },

  getArtistTracks: async (
    artistId: string,
    artistName: string
  ): Promise<UnifiedTrack[]> => {
    // Buscamos el artista en Deezer para obtener su ID
    const deezerArtists = await deezerApi.searchArtists(artistName);
    if (!deezerArtists.length) return [];

    // Obtenemos las canciones top de Deezer
    const deezerTracks = await deezerApi.getArtistTopTracks(deezerArtists[0].id);

    return deezerTracks.map(track => ({
      id: track.id.toString(),
      title: track.title,
      duration: track.duration,
      previewUrl: track.preview,
      albumId: track.album.id.toString(),
      artistId: track.artist.id.toString(),
    }));
  },
}; 