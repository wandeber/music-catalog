'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { ArtistCard } from '@/components/ArtistCard';
import { musicBrainzApi } from '@/services/musicbrainz';
import { MusicBrainzArtist } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

// Componente para el mensaje de estado
const StatusMessage = memo(function StatusMessage({
  message,
  icon,
}: {
  message: string;
  icon?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <MusicalNoteIcon className="w-12 h-12 text-[var(--muted)] mb-4 animate-pulse" />
      )}
      <p className="text-[var(--muted-foreground)]">{message}</p>
    </div>
  );
});

// Componente para la lista de artistas
const ArtistList = memo(function ArtistList({
  artists,
}: {
  artists: MusicBrainzArtist[];
}) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:auto] align-top">
      {artists.map((artist) => (
        <div key={artist.id} className="break-inside-avoid mb-6 [&:last-child]:mb-0">
          <ArtistCard artist={artist} />
        </div>
      ))}
    </div>
  );
});

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [artists, setArtists] = useState<MusicBrainzArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  const handleSearch = useCallback((query: string) => {
    setInputValue(query);
  }, []);

  useEffect(() => {
    const searchArtists = async () => {
      const term = debouncedSearchTerm.trim();
      
      if (term.length > 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/musicbrainz?action=search&query=${encodeURIComponent(term)}`);
          const results = await response.json();
          setArtists(prevArtists => {
            const newArtists = results.map(newArtist => {
              const existingArtist = prevArtists.find(a => a.id === newArtist.id);
              return existingArtist || newArtist;
            });
            return newArtists;
          });
        } catch (error) {
          console.error('Error searching artists:', error);
          setArtists([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setArtists([]);
      }
    };

    searchArtists();
  }, [debouncedSearchTerm]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="heading-1">
            Catálogo de Música
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Explora millones de artistas, álbumes y canciones. Descubre nueva música y 
            disfruta de información detallada sobre tus artistas favoritos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SearchInput
            value={inputValue}
            onChange={handleSearch}
            placeholder="Busca un artista..."
          />
        </div>

        <div className="space-y-6">
          {isSearching ? (
            <StatusMessage message="Buscando artistas..." icon />
          ) : debouncedSearchTerm.trim().length > 2 ? (
            artists.length > 0 ? (
              <ArtistList artists={artists} />
            ) : (
              <StatusMessage message="No se encontraron artistas" />
            )
          ) : debouncedSearchTerm.trim().length > 0 ? (
            <StatusMessage message="Escribe al menos 3 caracteres para buscar" />
          ) : (
            <StatusMessage 
              message="Empieza escribiendo el nombre de un artista" 
              icon 
            />
          )}
        </div>
      </div>
    </div>
  );
}
