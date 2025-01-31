'use client';

import { useEffect, useState, memo, use } from 'react';
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
        return 'badge-primary';
      case 'single':
        return 'badge-success';
      case 'ep':
        return 'badge-secondary';
      case 'compilation':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  return (
    <span className={`badge ${getTypeColor(type)}`}>
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
      <div className="card card-hover p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors flex-1">{album.title}</h3>
          <ReleaseBadge type={album.type || 'Álbum'} />
        </div>
        <div className="space-y-2">
          {album['first-release-date'] && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Lanzamiento: {new Date(album['first-release-date']).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {album.releases && album.releases > 0 && (
            <p className="text-xs text-[var(--muted-foreground)]">
              {album.releases} {album.releases === 1 ? 'edición' : 'ediciones'} diferentes
            </p>
          )}
          {secondaryTypes && secondaryTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {secondaryTypes.map((type) => (
                <span
                  key={type}
                  className="badge badge-secondary"
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

        const [artistResponse, releasesResponse] = await Promise.all([
          fetch(`/api/musicbrainz?action=artist&id=${id}`),
          fetch(`/api/musicbrainz?action=releases&id=${id}`)
        ]);

        const artistData = await artistResponse.json();
        const releasesData = await releasesResponse.json();

        if (!artistData) {
          setError('No se pudo encontrar el artista');
          return;
        }

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
        <p className="text-[var(--muted-foreground)]">Cargando información del artista...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="card p-6">
        <p className="text-[var(--muted-foreground)] mb-4">{error || 'No se encontró el artista'}</p>
        <Link 
          href="/"
          className="link"
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
    <div className="space-y-12">
      <section className="space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="heading-1">{artist.name}</h1>
            <div className="space-y-2">
              {artist.country && (
                <p className="text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">País:</span> {artist.country}
                </p>
              )}
              {artist['life-span']?.begin && (
                <p className="text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Formado en:</span>{' '}
                  {artist['life-span'].begin}
                  {artist['life-span'].ended && artist['life-span'].end && (
                    <> - Terminó en: {artist['life-span'].end}</>
                  )}
                </p>
              )}
            </div>
          </div>
          <Link 
            href="/"
            className="link"
          >
            Volver al inicio
          </Link>
        </div>

        {artist.tags && artist.tags.length > 0 && (
          <div>
            <h2 className="heading-2 mb-4">Géneros</h2>
            <div className="flex flex-wrap gap-2">
              {artist.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="badge badge-primary"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {releases.length > 0 && (
        <div className="space-y-12">
          {Object.entries(releasesByType).map(([type, typeReleases]) => (
            <section key={type} className="space-y-6">
              <h2 className="heading-2">
                {type} <span className="text-[var(--muted-foreground)]">({typeReleases.length})</span>
              </h2>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {typeReleases.map((release) => (
                  <div key={release.id} className="break-inside-avoid mb-6">
                    <AlbumCard album={release} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
} 