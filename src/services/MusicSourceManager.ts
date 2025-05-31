
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
  private jamendoClientId = 'demo-client'; // En producción, usar variable de entorno
  private internetArchiveBase = 'https://archive.org/advancedsearch.php';
  private cache = new Map<string, ExternalTrack[]>();
  private currentSources: ('jamendo' | 'internet_archive')[] = ['jamendo', 'internet_archive'];
  private currentSourceIndex = 0;

  async getExternalTracks(count: number = 10): Promise<ExternalTrack[]> {
    const source = this.getCurrentSource();
    
    try {
      switch (source) {
        case 'jamendo':
          return await this.getJamendoTracks(count);
        case 'internet_archive':
          return await this.getInternetArchiveTracks(count);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      this.rotateSource();
      return this.getExternalTracks(count); // Retry with next source
    }
  }

  private getCurrentSource() {
    return this.currentSources[this.currentSourceIndex];
  }

  private rotateSource() {
    this.currentSourceIndex = (this.currentSourceIndex + 1) % this.currentSources.length;
  }

  private async getJamendoTracks(count: number): Promise<ExternalTrack[]> {
    const cacheKey = `jamendo_${count}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Obtener lista de radios disponibles
      const radiosResponse = await fetch(
        `https://api.jamendo.com/v3.0/radios/?client_id=${this.jamendoClientId}&format=json&limit=5`
      );
      
      if (!radiosResponse.ok) {
        throw new Error(`Jamendo API error: ${radiosResponse.status}`);
      }

      const radiosData = await radiosResponse.json();
      const tracks: ExternalTrack[] = [];

      // Simular obtención de tracks de radio (en producción, usar streams reales)
      for (let i = 0; i < Math.min(count, 10); i++) {
        const mockTrack: ExternalTrack = {
          id: `jamendo_${Date.now()}_${i}`,
          title: `Independent Track ${i + 1}`,
          artist: `Indie Artist ${i + 1}`,
          duration: 180 + Math.floor(Math.random() * 120),
          stream_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo URL
          artwork_url: `https://picsum.photos/300/300?random=${i}`,
          genre: ['Electronic', 'Indie', 'Ambient', 'Jazz'][Math.floor(Math.random() * 4)],
          source: 'jamendo',
          license: 'Creative Commons',
          attribution: `Track provided by Jamendo`
        };
        tracks.push(mockTrack);
      }

      this.cache.set(cacheKey, tracks);
      return tracks;
    } catch (error) {
      console.error('Error fetching Jamendo tracks:', error);
      throw error;
    }
  }

  private async getInternetArchiveTracks(count: number): Promise<ExternalTrack[]> {
    const cacheKey = `ia_${count}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Simulación de Internet Archive - en producción usar API real
      const tracks: ExternalTrack[] = [];
      
      for (let i = 0; i < Math.min(count, 8); i++) {
        const mockTrack: ExternalTrack = {
          id: `ia_${Date.now()}_${i}`,
          title: `Archive Collection ${i + 1}`,
          artist: `Archive Artist ${i + 1}`,
          duration: 200 + Math.floor(Math.random() * 100),
          stream_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo URL
          artwork_url: `https://picsum.photos/300/300?random=${i + 20}`,
          genre: ['Classical', 'Folk', 'World', 'Experimental'][Math.floor(Math.random() * 4)],
          source: 'internet_archive',
          license: 'Public Domain',
          attribution: 'Courtesy of Internet Archive'
        };
        tracks.push(mockTrack);
      }

      this.cache.set(cacheKey, tracks);
      return tracks;
    } catch (error) {
      console.error('Error fetching Internet Archive tracks:', error);
      throw error;
    }
  }

  // Sistema de cola inteligente con priorización
  generateQueue(userTracks: Track[], userSubscriptionTier: string = 'free'): QueueItem[] {
    const queue: QueueItem[] = [];
    
    // Prioridades basadas en suscripción
    const priorities = {
      free: { user: 60, external: 40 },
      artist_basic: { user: 70, external: 30 },
      artist_premium: { user: 80, external: 20 },
      advertiser_basic: { user: 75, external: 25 },
      advertiser_premium: { user: 85, external: 15 }
    };

    const userPriority = priorities[userSubscriptionTier as keyof typeof priorities] || priorities.free;

    // Añadir tracks de usuario con prioridad
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

    try {
      const externalTracks = await this.getExternalTracks(externalNeeded);
      
      const externalQueueItems: QueueItem[] = externalTracks.map((track, index) => ({
        track,
        priority: 30 - index, // Prioridad decreciente
        source: 'external',
        preloaded: false
      }));

      return [...currentQueue, ...externalQueueItems]
        .sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Error filling queue with external content:', error);
      return currentQueue;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
