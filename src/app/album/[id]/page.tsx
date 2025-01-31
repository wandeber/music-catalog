'use client';

import { useEffect, useState, memo, use } from 'react';
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
    <div className="flex items-center py-3 px-4 hover:bg-[var(--card-hover)] rounded-lg transition-colors group">
      <div className="w-12 text-[var(--muted-foreground)] text-sm">{position}</div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
          {track.title}
        </h3>
        {track.artist && track.artist !== track['artist-credit'] && (
          <p className="text-sm text-[var(--muted-foreground)] truncate">{track.artist}</p>
        )}
      </div>
      {track.length && (
        <div className="text-[var(--muted-foreground)] text-sm">
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

        const response = await fetch(`/api/musicbrainz?action=release&id=${id}`);
        const data = await response.json();

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
        <p className="text-[var(--muted-foreground)]">Cargando información del álbum...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="card p-6">
        <p className="text-[var(--muted-foreground)] mb-4">{error || 'No se encontró el álbum'}</p>
        <Link 
          href="/"
          className="link"
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
    <div className="space-y-12">
      <section className="space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div>
              <h1 className="heading-1 mb-2">{album.title}</h1>
              <Link 
                href={`/artist/${album['artist-credit']?.[0]?.artist?.id}`}
                className="text-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
              >
                {artistName}
              </Link>
            </div>

            <div className="space-y-2">
              {album['first-release-date'] && (
                <p className="text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Fecha de lanzamiento:</span>{' '}
                  {new Date(album['first-release-date']).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {mainRelease?.country && (
                <p className="text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">País:</span> {mainRelease.country}
                </p>
              )}
              {album['primary-type'] && (
                <p className="text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Tipo:</span> {album['primary-type']}
                </p>
              )}
            </div>
          </div>
          <Link 
            href={`/artist/${album['artist-credit']?.[0]?.artist?.id}`}
            className="link"
          >
            Volver al artista
          </Link>
        </div>
      </section>

      {tracks.length > 0 && (
        <section className="space-y-6">
          <h2 className="heading-2">
            Lista de canciones <span className="text-[var(--muted-foreground)]">({tracks.length})</span>
          </h2>
          <div className="card divide-y divide-[var(--border)]">
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