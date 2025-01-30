'use client';

import { useEffect, useState, memo, use } from 'react';
import { musicBrainzApi } from '@/services/musicbrainz';
import type { MusicBrainzArtist, MusicBrainzAlbum } from '@/types/api';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Componente para el badge de tipo de lanzamiento
const ReleaseBadge = memo(function ReleaseBadge({ type }: { type: string }) {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'album':
        return 'bg-blue-100 text-blue-800';
      case 'single':
        return 'bg-green-100 text-green-800';
      case 'ep':
        return 'bg-purple-100 text-purple-800';
      case 'compilation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(type)}`}>
      {type}
    </span>
  );
});

// Componente para cada álbum
const AlbumCard = memo(function AlbumCard({
  album,
}: {
  album: MusicBrainzAlbum;
}) {
  const secondaryTypes = album['release-group']?.['secondary-types'];
  
  return (
    <Link href={`/album/${album.id}`}>
      <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">{album.title}</h3>
          <ReleaseBadge type={album.type || 'Álbum'} />
        </div>
        <div className="space-y-2">
          {album['first-release-date'] && (
            <p className="text-sm text-gray-600">
              Lanzamiento: {new Date(album['first-release-date']).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {album.releases && album.releases > 0 && (
            <p className="text-xs text-gray-500">
              {album.releases} {album.releases === 1 ? 'edición' : 'ediciones'} diferentes
            </p>
          )}
          {secondaryTypes && secondaryTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {secondaryTypes.map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

export default function ArtistPage({ params }: PageProps) {
  const { id } = use(params);
  const [artist, setArtist] = useState<MusicBrainzArtist | null>(null);
  const [releases, setReleases] = useState<MusicBrainzAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArtist = async () => {
      try {
        setLoading(true);
        setError(null);

        const artistData = await musicBrainzApi.getArtist(id);
        if (!artistData) {
          setError('No se pudo encontrar el artista');
          return;
        }

        const releasesData = await musicBrainzApi.getArtistReleases(id);
        
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
  }, [id]);

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

  // Agrupar releases por tipo
  const releasesByType = releases.reduce((acc, release) => {
    const type = release.type || 'Otros';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(release);
    return acc;
  }, {} as Record<string, MusicBrainzAlbum[]>);

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
        <div className="space-y-8">
          {Object.entries(releasesByType).map(([type, typeReleases]) => (
            <section key={type} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {type} ({typeReleases.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeReleases.map((release) => (
                  <AlbumCard key={release.id} album={release} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
} 