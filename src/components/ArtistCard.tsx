import { memo } from 'react';
import { MusicBrainzArtist } from '@/types/api';
import Link from 'next/link';

interface ArtistCardProps {
  artist: MusicBrainzArtist;
}

export const ArtistCard = memo(function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artist/${artist.id}`}>
      <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
        <div className="mt-2 space-y-2">
          {artist.country && (
            <p className="text-sm text-gray-600">
              País: {artist.country}
            </p>
          )}
          {artist['life-span']?.begin && (
            <p className="text-sm text-gray-600">
              Formado en: {artist['life-span'].begin}
            </p>
          )}
          {artist.tags && artist.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artist.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.name}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}); 