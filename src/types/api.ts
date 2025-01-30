// MusicBrainz Types
export interface MusicBrainzArtist {
  id: string;
  name: string;
  type?: string;
  country?: string;
  'life-span'?: {
    begin?: string;
    end?: string;
    ended?: boolean;
  };
  tags?: Array<{ name: string }>;
}

export interface MusicBrainzAlbum {
  id: string;
  title: string;
  'first-release-date'?: string;
  'release-group'?: {
    'primary-type'?: string;
    'secondary-types'?: string[];
  };
  'artist-credit'?: string;
  releases?: number;
  type?: string;
}

export interface MusicBrainzRelease {
  id: string;
  title: string;
  status?: string;
  'release-events'?: Array<{
    date?: string;
    area?: {
      name: string;
    };
  }>;
  media?: Array<{
    format?: string;
    'track-count'?: number;
  }>;
  date?: string;
  country?: string;
  'track-count'?: number;
}

// Last.fm Types
export interface LastFmArtist {
  name: string;
  mbid?: string; // MusicBrainz ID
  url: string;
  image: Array<{
    '#text': string;
    size: string;
  }>;
  bio?: {
    summary: string;
    content: string;
  };
  similar?: {
    artist: LastFmArtist[];
  };
  tags?: {
    tag: Array<{ name: string }>;
  };
}

// Deezer Types
export interface DeezerArtist {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_album: number;
  nb_fan: number;
}

export interface DeezerTrack {
  id: number;
  title: string;
  preview: string;
  duration: number;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
  };
}

// Unified Types (los que usaremos en nuestra aplicación)
export interface UnifiedArtist {
  id: string;
  name: string;
  images: {
    small?: string;
    medium?: string;
    large?: string;
  };
  biography?: string;
  country?: string;
  tags: string[];
  similar?: UnifiedArtist[];
  yearFormed?: string;
  yearDisbanded?: string;
}

export interface UnifiedAlbum {
  id: string;
  title: string;
  releaseDate?: string;
  type?: string;
  coverUrl?: string;
  tracks?: UnifiedTrack[];
}

export interface UnifiedTrack {
  id: string;
  title: string;
  duration: number;
  previewUrl?: string;
  albumId?: string;
  artistId?: string;
} 