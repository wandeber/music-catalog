import { NextResponse } from 'next/server';
import { musicBrainzApi } from '@/services/musicbrainz';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const id = searchParams.get('id');

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  try {
    let data;
    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }
        data = await musicBrainzApi.searchArtists(query);
        break;
      case 'artist':
        if (!id) {
          return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
        }
        data = await musicBrainzApi.getArtist(id);
        break;
      case 'releases':
        if (!id) {
          return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
        }
        data = await musicBrainzApi.getArtistReleases(id);
        break;
      case 'release':
        if (!id) {
          return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
        }
        data = await musicBrainzApi.getReleaseGroupDetails(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 