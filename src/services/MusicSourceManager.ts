
import { Track } from '@/types';

export interface ExternalTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  stream_url: string;
  artwork_url?: string;
  genre?: string;
  source: 'jamendo' | 'internet_archive' | 'soundcloud' | 'user';
  license?: string;
  attribution?: string;
}

export interface QueueItem {
  track: Track | ExternalTrack;
  priority: number;
  source: 'user' | 'external';
  preloaded: boolean;
}

export class MusicSourceManager {
  private jamendoClientId = '8ea38398';
  private cache = new Map<string, ExternalTrack[]>();
  private currentSources: ('jamendo')[] = ['jamendo']; // Removido internet_archive temporalmente
  private currentSourceIndex = 0;
  private lastJamendoPage = 0;

  async getExternalTracks(count: number = 10): Promise<ExternalTrack[]> {
    const source = this.getCurrentSource();
    
    try {
      switch (source) {
        case 'jamendo':
          return await this.getJamendoTracks(count);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      return this.getFallbackTracks(count);
    }
  }

  private getCurrentSource() {
    return this.currentSources[this.currentSourceIndex];
  }

  private async validateAudioUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Evitar problemas de CORS en validación
      });
      return true; // Si no hay error de red, asumimos que es válida
    } catch (error) {
      console.warn(`URL validation failed for: ${url}`, error);
      return false;
    }
  }

  private async getJamendoTracks(count: number): Promise<ExternalTrack[]> {
    this.lastJamendoPage = (this.lastJamendoPage % 10) + 1; // Rotar páginas 1-10
    const cacheKey = `jamendo_${count}_${this.lastJamendoPage}`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`Using cached Jamendo tracks for page ${this.lastJamendoPage}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log(`Fetching Jamendo tracks from page ${this.lastJamendoPage}`);
      
      const tracksResponse = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${this.jamendoClientId}&format=json&limit=${count}&offset=${(this.lastJamendoPage - 1) * count}&order=popularity_total&include=musicinfo&audioformat=mp32&tags=rock+pop+electronic&fuzzytags=1`
      );
      
      if (!tracksResponse.ok) {
        throw new Error(`Jamendo API error: ${tracksResponse.status}`);
      }

      const tracksData = await tracksResponse.json();
      
      if (tracksData.headers.status !== 'success') {
        throw new Error(`Jamendo API error: ${tracksData.headers.error_message}`);
      }

      if (!tracksData.results || tracksData.results.length === 0) {
        throw new Error('No tracks returned from Jamendo API');
      }

      console.log(`Successfully fetched ${tracksData.results.length} tracks from Jamendo`);

      const tracks: ExternalTrack[] = [];
      
      for (const track of tracksData.results) {
        // Validar que el track tenga las propiedades necesarias
        if (!track.audio || !track.name || !track.artist_name) {
          console.warn('Skipping incomplete track:', track);
          continue;
        }

        const externalTrack: ExternalTrack = {
          id: `jamendo_${track.id}`,
          title: track.name,
          artist: track.artist_name,
          duration: parseInt(track.duration) || 180, // Fallback duration
          stream_url: track.audio,
          artwork_url: track.album_image || track.image,
          genre: track.musicinfo?.tags?.genres?.[0] || 'Unknown',
          source: 'jamendo' as const,
          license: 'Creative Commons',
          attribution: `"${track.name}" by ${track.artist_name} from Jamendo`
        };

        console.log(`Added track: ${externalTrack.title} by ${externalTrack.artist}`);
        tracks.push(externalTrack);
      }

      if (tracks.length === 0) {
        throw new Error('No valid tracks processed from Jamendo response');
      }

      this.cache.set(cacheKey, tracks);
      return tracks;
    } catch (error) {
      console.error('Error fetching Jamendo tracks:', error);
      throw error;
    }
  }

  private getFallbackTracks(count: number): ExternalTrack[] {
    console.log('Using fallback tracks due to API failure');
    
    // Tracks de fallback con URLs más confiables
    const fallbackTracks: ExternalTrack[] = [
      {
        id: 'fallback_1',
        title: 'Ambient Soundscape',
        artist: 'Fallback Artist',
        duration: 180,
        stream_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        source: 'jamendo',
        license: 'Creative Commons',
        attribution: 'Fallback content'
      }
    ];

    return fallbackTracks.slice(0, count);
  }

  // Sistema de cola inteligente con priorización
  generateQueue(userTracks: Track[], userSubscriptionTier: string = 'free'): QueueItem[] {
    const queue: QueueItem[] = [];
    
    const priorities = {
      free: { user: 60, external: 40 },
      artist_basic: { user: 70, external: 30 },
      artist_premium: { user: 80, external: 20 },
      advertiser_basic: { user: 75, external: 25 },
      advertiser_premium: { user: 85, external: 15 }
    };

    const userPriority = priorities[userSubscriptionTier as keyof typeof priorities] || priorities.free;

    userTracks.forEach((track, index) => {
      queue.push({
        track,
        priority: userPriority.user + (userTracks.length - index),
        source: 'user',
        preloaded: false
      });
    });

    return queue;
  }

  async fillQueueWithExternal(currentQueue: QueueItem[], targetSize: number = 20): Promise<QueueItem[]> {
    const externalNeeded = Math.max(0, targetSize - currentQueue.length);
    
    if (externalNeeded === 0) return currentQueue;

    console.log(`Filling queue with ${externalNeeded} external tracks`);

    try {
      const externalTracks = await this.getExternalTracks(externalNeeded);
      
      if (externalTracks.length === 0) {
        console.warn('No external tracks available');
        return currentQueue;
      }

      const externalQueueItems: QueueItem[] = externalTracks.map((track, index) => ({
        track,
        priority: 30 - index,
        source: 'external',
        preloaded: false
      }));

      const newQueue = [...currentQueue, ...externalQueueItems]
        .sort((a, b) => b.priority - a.priority);

      console.log(`Queue filled successfully. Total items: ${newQueue.length}`);
      return newQueue;
    } catch (error) {
      console.error('Error filling queue with external content:', error);
      return currentQueue;
    }
  }

  clearCache() {
    this.cache.clear();
    this.lastJamendoPage = 0;
  }
}
