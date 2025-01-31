import { memo } from 'react';
import { MusicBrainzArtist } from '@/types/api';
import Link from 'next/link';
import { UserIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ArtistCardProps {
  artist: MusicBrainzArtist;
}

export const ArtistCard = memo(function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artist/${artist.id}`}>
      <div className="card card-hover p-6 group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
              {artist.name}
            </h3>
            <div className="mt-2 space-y-2">
              {artist.country && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{artist.country}</span>
                </div>
              )}
              {artist['life-span']?.begin && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {artist['life-span'].begin}
                    {artist['life-span'].ended && artist['life-span'].end && (
                      <> - {artist['life-span'].end}</>
                    )}
                  </span>
                </div>
              )}
              {artist.tags && artist.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {artist.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.name}
                      className="badge badge-primary"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}); 