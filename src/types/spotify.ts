export interface Artist {
  id: string;
  name: string;
  images: Image[];
  genres: string[];
  popularity: number;
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
  release_date: string;
  total_tracks: number;
  artists: Artist[];
}

export interface Track {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  preview_url: string | null;
}

export interface Image {
  url: string;
  height: number;
  width: number;
} 