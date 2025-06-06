
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
  private currentSources: ('jamendo')[] = ['jamendo'];
  private currentSourceIndex = 0;
  private lastJamendoPage = 0;
  private jamendoSearchStrategies = [
    // Simplified strategies - less restrictive
    { tags: '', order: 'popularity_total' },
    { tags: '', order: 'popularity_month' },
    { tags: '', order: 'releasedate' },
    { tags: 'rock', order: 'popularity_total' },
    { tags: 'electronic', order: 'popularity_total' },
    { tags: 'pop', order: 'popularity_total' }
  ];
  private currentStrategyIndex = 0;

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
      return this.getReliableFallbackTracks(count);
    }
  }

  private getCurrentSource() {
    return this.currentSources[this.currentSourceIndex];
  }

  private async getJamendoTracks(count: number): Promise<ExternalTrack[]> {
    // Try different search strategies
    for (let strategyAttempt = 0; strategyAttempt < this.jamendoSearchStrategies.length; strategyAttempt++) {
      try {
        const strategy = this.jamendoSearchStrategies[this.currentStrategyIndex];
        this.lastJamendoPage = (this.lastJamendoPage % 10) + 1; // Rotate pages 1-10
        
        const cacheKey = `jamendo_${count}_${this.lastJamendoPage}_${this.currentStrategyIndex}`;
        
        if (this.cache.has(cacheKey)) {
          const cached = this.cache.get(cacheKey)!;
          if (cached.length > 0) {
            console.log(`Using cached Jamendo tracks for strategy ${this.currentStrategyIndex}, page ${this.lastJamendoPage}`);
            return cached;
          }
        }

        console.log(`Fetching Jamendo tracks - Strategy: ${this.currentStrategyIndex}, Page: ${this.lastJamendoPage}, Tags: "${strategy.tags}"`);
        
        // Build simplified URL
        let url = `https://api.jamendo.com/v3.0/tracks/?client_id=${this.jamendoClientId}&format=json&limit=${count}&offset=${(this.lastJamendoPage - 1) * count}&order=${strategy.order}&include=musicinfo&audioformat=mp32`;
        
        // Only add tags if they exist
        if (strategy.tags && strategy.tags.trim()) {
          url += `&tags=${encodeURIComponent(strategy.tags)}`;
        }

        console.log(`Jamendo API URL: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const tracksResponse = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!tracksResponse.ok) {
          throw new Error(`Jamendo API HTTP error: ${tracksResponse.status} ${tracksResponse.statusText}`);
        }

        const tracksData = await tracksResponse.json();
        console.log('Jamendo API response status:', tracksData.headers?.status);
        console.log('Number of results:', tracksData.results?.length || 0);
        
        if (tracksData.headers?.status !== 'success') {
          throw new Error(`Jamendo API error: ${tracksData.headers?.error_message || 'Unknown error'}`);
        }

        if (!tracksData.results || tracksData.results.length === 0) {
          console.warn(`No tracks returned for strategy ${this.currentStrategyIndex} (${strategy.tags || 'no tags'}), trying next strategy...`);
          this.currentStrategyIndex = (this.currentStrategyIndex + 1) % this.jamendoSearchStrategies.length;
          continue;
        }

        console.log(`Successfully fetched ${tracksData.results.length} tracks from Jamendo using strategy ${this.currentStrategyIndex}`);

        const tracks: ExternalTrack[] = [];
        
        for (const track of tracksData.results) {
          // More lenient validation
          if (!track.audio || !track.name || !track.artist_name) {
            console.warn('Skipping incomplete track:', track.id);
            continue;
          }

          // Basic URL validation
          if (!this.isValidAudioUrl(track.audio)) {
            console.warn(`Skipping track with invalid audio URL: ${track.audio}`);
            continue;
          }

          const externalTrack: ExternalTrack = {
            id: `jamendo_${track.id}`,
            title: track.name,
            artist: track.artist_name,
            duration: parseInt(track.duration) || 180,
            stream_url: track.audio,
            artwork_url: track.album_image || track.image,
            genre: track.musicinfo?.tags?.genres?.[0] || 'Unknown',
            source: 'jamendo' as const,
            license: 'Creative Commons',
            attribution: `"${track.name}" by ${track.artist_name} from Jamendo`
          };

          console.log(`✓ Valid track added: ${externalTrack.title} by ${externalTrack.artist}`);
          tracks.push(externalTrack);
        }

        if (tracks.length === 0) {
          console.warn(`No valid tracks processed from Jamendo response for strategy ${this.currentStrategyIndex}, trying next strategy...`);
          this.currentStrategyIndex = (this.currentStrategyIndex + 1) % this.jamendoSearchStrategies.length;
          continue;
        }

        // Success! Cache and return
        this.cache.set(cacheKey, tracks);
        return tracks;

      } catch (error) {
        console.error(`Strategy ${this.currentStrategyIndex} failed:`, error);
        this.currentStrategyIndex = (this.currentStrategyIndex + 1) % this.jamendoSearchStrategies.length;
      }
    }

    // All strategies failed
    throw new Error('All Jamendo search strategies failed');
  }

  private isValidAudioUrl(url: string): boolean {
    try {
      // Basic URL format validation
      if (!url || typeof url !== 'string') {
        return false;
      }
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
      }
      
      // Check if it contains Jamendo domain or audio-like extensions
      if (url.includes('jamendo.com') || 
          url.includes('.mp3') || 
          url.includes('audio') ||
          url.includes('trackid=')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn(`URL validation failed for: ${url}`, error);
      return false;
    }
  }

  private getReliableFallbackTracks(count: number): ExternalTrack[] {
    console.log('Using reliable fallback tracks due to API failure');
    
    // More reliable fallback tracks with working URLs
    const fallbackTracks: ExternalTrack[] = [
      {
        id: 'fallback_1',
        title: 'Demo Track 1',
        artist: 'Demo Artist',
        duration: 240,
        stream_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
        source: 'jamendo',
        license: 'Demo Content',
        attribution: 'Demo content for testing',
        genre: 'Demo'
      },
      {
        id: 'fallback_2',
        title: 'Demo Track 2',
        artist: 'Demo Artist',
        duration: 180,
        stream_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav',
        source: 'jamendo',
        license: 'Demo Content',
        attribution: 'Demo content for testing',
        genre: 'Demo'
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
    this.currentStrategyIndex = 0;
  }
}
