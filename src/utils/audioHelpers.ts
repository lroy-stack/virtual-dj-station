
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';

// Helper function to get audio URL consistently
export const getAudioUrl = (track: Track | ExternalTrack): string => {
  return 'file_url' in track ? track.file_url : track.stream_url;
};

// Helper function to check if track is user track
export const isUserTrack = (track: Track | ExternalTrack): track is Track => {
  return 'file_url' in track;
};

// Helper function to get artwork URL
export const getArtworkUrl = (track: Track | ExternalTrack): string | undefined => {
  return track.artwork_url;
};

// Helper function to format track duration
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to validate audio URL
export const isValidAudioUrl = (url: string): boolean => {
  try {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Check for common audio patterns
    const audioPatterns = [
      'jamendo.com',
      '.mp3',
      '.wav',
      '.ogg',
      '.m4a',
      'audio',
      'trackid=',
      'soundcloud.com'
    ];
    
    return audioPatterns.some(pattern => url.includes(pattern));
  } catch (error) {
    console.warn(`URL validation failed for: ${url}`, error);
    return false;
  }
};
