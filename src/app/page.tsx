'use client';

import { useState, useCallback, memo, useEffect, useMemo } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { ArtistCard } from '@/components/ArtistCard';
import { musicBrainzApi } from '@/services/musicbrainz';
import { MusicBrainzArtist } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';

// Componente para el spinner de carga
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-600">Buscando...</span>
    </div>
  );
});

// Componente individual para cada artista
const ArtistItem = memo(function ArtistItem({
  artist,
}: {
  artist: MusicBrainzArtist;
}) {
  return (
    <div className="col-span-1">
      <ArtistCard artist={artist} />
    </div>
  );
});

// Componente memorizado para la lista de artistas
const ArtistList = memo(function ArtistList({
  artists,
}: {
  artists: MusicBrainzArtist[];
}) {
  // Usamos useMemo para mantener la referencia de los elementos que no cambian
  const artistElements = useMemo(
    () =>
      artists.map((artist) => (
        <ArtistItem key={artist.id} artist={artist} />
      )),
    [artists]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artistElements}
    </div>
  );
});

// Componente memorizado para el mensaje de estado
const StatusMessage = memo(function StatusMessage({
  message,
}: {
  message: string;
}) {
  return <p className="text-gray-600">{message}</p>;
});

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [artists, setArtists] = useState<MusicBrainzArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  const handleSearch = useCallback((query: string) => {
    setInputValue(query);
  }, []);

  // Efecto para realizar la búsqueda cuando el término debounced cambia
  useEffect(() => {
    const searchArtists = async () => {
      const term = debouncedSearchTerm.trim();
      
      if (term.length > 2) {
        setIsSearching(true);
        try {
          const results = await musicBrainzApi.searchArtists(term);
          // Comparamos los resultados actuales con los nuevos
          setArtists(prevArtists => {
            // Si los IDs son los mismos, mantenemos las referencias anteriores
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

  // Memorizamos el contenido principal
  const content = useMemo(() => {
    if (debouncedSearchTerm.trim().length > 2) {
      if (artists.length > 0) {
        return <ArtistList artists={artists} />;
      }
      return <StatusMessage message="No se encontraron artistas" />;
    }

    if (debouncedSearchTerm.trim().length > 0) {
      return <StatusMessage message="Escribe al menos 3 caracteres para buscar" />;
    }

    return null;
  }, [debouncedSearchTerm, artists]);

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Bienvenido al Catálogo de Música
        </h2>
        <div className="max-w-2xl">
          <SearchInput
            value={inputValue}
            onChange={handleSearch}
            placeholder="Busca un artista..."
          />
        </div>
      </section>

      <section className="space-y-4">
        {content}
        {isSearching && <LoadingSpinner />}
      </section>
    </div>
  );
}
