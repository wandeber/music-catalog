'use client';

import { useEffect, useState, use } from 'react';
import { musicBrainzApi } from '@/services/musicbrainz';
import type { MusicBrainzArtist, MusicBrainzAlbum } from '@/types/api';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ArtistPage({ params }: PageProps) {
  const { id: artistId } = use(params);
  const [artist, setArtist] = useState<MusicBrainzArtist | null>(null);
  const [releases, setReleases] = useState<MusicBrainzAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArtist = async () => {
      if (!artistId) return;

      try {
        setLoading(true);
        setError(null);

        const artistData = await musicBrainzApi.getArtist(artistId);
        if (!artistData) {
          setError('No se pudo encontrar el artista');
          return;
        }

        const releasesData = await musicBrainzApi.getArtistReleases(artistId);
        
        setArtist(artistData);
        setReleases(releasesData);
      } catch (err) {
        console.error('Error loading artist:', err);
        setError('Ocurrió un error al cargar la información del artista');
      } finally {
        setLoading(false);
      }
    };

    loadArtist();
  }, [artistId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">Cargando información del artista...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4">{error || 'No se encontró el artista'}</p>
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{artist.name}</h1>
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Volver al inicio
          </Link>
        </div>
        <div className="space-y-4">
          {artist.country && (
            <p className="text-gray-600">
              <span className="font-semibold">País:</span> {artist.country}
            </p>
          )}
          {artist['life-span']?.begin && (
            <p className="text-gray-600">
              <span className="font-semibold">Formado en:</span>{' '}
              {artist['life-span'].begin}
              {artist['life-span'].ended && artist['life-span'].end && (
                <> - Terminó en: {artist['life-span'].end}</>
              )}
            </p>
          )}
          {artist.tags && artist.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Géneros</h2>
              <div className="flex flex-wrap gap-2">
                {artist.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {releases.length > 0 && (
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Discografía ({releases.length} {releases.length === 1 ? 'lanzamiento' : 'lanzamientos'})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases.map((release) => (
              <div
                key={release.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{release.title}</h3>
                {release['first-release-date'] && (
                  <p className="text-sm text-gray-600 mt-1">
                    {release['first-release-date']}
                  </p>
                )}
                {release['release-group']?.['primary-type'] && (
                  <p className="text-xs text-gray-500 mt-1">
                    {release['release-group']['primary-type']}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 