'use client';

import { useEffect, useState, memo, use } from 'react';
import { musicBrainzApi } from '@/services/musicbrainz';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Componente para mostrar la duración en formato mm:ss
const Duration = memo(function Duration({ ms }: { ms: number }) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>;
});

// Componente para cada pista
const TrackItem = memo(function TrackItem({
  track,
  position,
}: {
  track: any;
  position: string;
}) {
  return (
    <div className="flex items-center py-2 hover:bg-gray-50 px-4 rounded-lg group">
      <div className="w-12 text-gray-400 text-sm">{position}</div>
      <div className="flex-1">
        <h3 className="text-gray-900 group-hover:text-blue-600 transition-colors">
          {track.title}
        </h3>
        {track.artist && track.artist !== track['artist-credit'] && (
          <p className="text-sm text-gray-500">{track.artist}</p>
        )}
      </div>
      {track.length && (
        <div className="text-gray-400 text-sm">
          <Duration ms={track.length} />
        </div>
      )}
    </div>
  );
});

export default function AlbumPage({ params }: PageProps) {
  const { id } = use(params);
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await musicBrainzApi.getReleaseGroupDetails(id);
        if (!data) {
          setError('No se pudo encontrar el álbum');
          return;
        }

        setAlbum(data);
      } catch (err) {
        console.error('Error loading album:', err);
        setError('Ocurrió un error al cargar la información del álbum');
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">Cargando información del álbum...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4">{error || 'No se encontró el álbum'}</p>
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const mainRelease = album.releases?.[0];
  const artistName = album['artist-credit']?.[0]?.name || 'Artista desconocido';
  const tracks = mainRelease?.media?.[0]?.tracks || [];

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.title}</h1>
            <p className="text-xl text-gray-600">{artistName}</p>
          </div>
          <Link 
            href={`/artist/${album['artist-credit']?.[0]?.artist?.id}`}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Volver al artista
          </Link>
        </div>
        <div className="space-y-4">
          {album['first-release-date'] && (
            <p className="text-gray-600">
              <span className="font-semibold">Fecha de lanzamiento:</span>{' '}
              {new Date(album['first-release-date']).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {mainRelease?.country && (
            <p className="text-gray-600">
              <span className="font-semibold">País:</span> {mainRelease.country}
            </p>
          )}
          {album['primary-type'] && (
            <p className="text-gray-600">
              <span className="font-semibold">Tipo:</span> {album['primary-type']}
            </p>
          )}
        </div>
      </section>

      {tracks.length > 0 && (
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Lista de canciones
          </h2>
          <div className="divide-y divide-gray-100">
            {tracks.map((track: any) => (
              <TrackItem
                key={track.id}
                track={track}
                position={track.number || '-'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 