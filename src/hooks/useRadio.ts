
import { useState, useCallback, useRef, useEffect } from 'react';
import { RadioState, Track, Advertisement, DJTalk } from '@/types';
import { MusicSourceManager, ExternalTrack } from '@/services/MusicSourceManager';
import { useToast } from '@/hooks/use-toast';

export const useRadio = () => {
  const [radioState, setRadioState] = useState<RadioState>({
    isPlaying: false,
    currentTrack: null,
    volume: 0.7,
    progress: 0,
    playlist: [],
    history: [],
    djActive: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicSourceManager = useRef(new MusicSourceManager());
  const currentTrackIndex = useRef(0);
  const [tracks, setTracks] = useState<ExternalTrack[]>([]);
  const { toast } = useToast();

  // Initialize with real Jamendo tracks
  useEffect(() => {
    const loadInitialTracks = async () => {
      try {
        console.log('Loading initial tracks from Jamendo...');
        const jamendoTracks = await musicSourceManager.current.getExternalTracks(15);
        console.log(`Loaded ${jamendoTracks.length} tracks from Jamendo`);
        setTracks(jamendoTracks);
        
        if (jamendoTracks.length > 0) {
          setRadioState(prev => ({
            ...prev,
            currentTrack: jamendoTracks[0]
          }));
          console.log(`Current track set to: ${jamendoTracks[0].title}`);
        }
      } catch (error) {
        console.error('Error loading initial tracks:', error);
        toast({
          title: "Error de carga",
          description: "No se pudieron cargar las canciones iniciales",
          variant: "destructive"
        });
      }
    };

    loadInitialTracks();
  }, [toast]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = radioState.volume;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setRadioState(prev => ({
          ...prev,
          progress: (audio.currentTime / audio.duration) * 100
        }));
      }
    };

    const handleEnded = () => {
      console.log('Track ended, moving to next');
      nextTrack();
    };

    const handleLoadStart = () => {
      console.log('Loading audio...');
    };

    const handleCanPlay = () => {
      console.log('Audio ready to play');
    };

    const handleError = (error: Event) => {
      const audioError = (error.target as HTMLAudioElement)?.error;
      console.error('Audio playback error:', {
        error: audioError,
        code: audioError?.code,
        message: audioError?.message,
        currentSrc: audio.src
      });
      
      // Move to next track on error
      setTimeout(() => {
        nextTrack();
      }, 1000);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Helper function to get the correct URL for any track type
  const getTrackUrl = (track: Track | ExternalTrack): string => {
    return 'file_url' in track ? track.file_url : track.stream_url;
  };

  const play = useCallback(async () => {
    if (!audioRef.current || !radioState.currentTrack) return;

    try {
      const trackUrl = getTrackUrl(radioState.currentTrack);
      if (audioRef.current.src !== trackUrl) {
        console.log(`Loading new track URL: ${trackUrl}`);
        audioRef.current.src = trackUrl;
      }
      
      console.log('Starting playback...');
      await audioRef.current.play();
      setRadioState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error de reproducción",
        description: "No se pudo reproducir la canción actual",
        variant: "destructive"
      });
    }
  }, [radioState.currentTrack, toast]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setRadioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (radioState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [radioState.isPlaying, play, pause]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setRadioState(prev => ({ ...prev, volume }));
    }
  }, []);

  const nextTrack = useCallback(async () => {
    if (tracks.length === 0) return;

    // Move to next track in the list
    currentTrackIndex.current = (currentTrackIndex.current + 1) % tracks.length;
    
    // If we're near the end, load more tracks
    if (currentTrackIndex.current >= tracks.length - 2) {
      try {
        console.log('Loading more tracks...');
        const moreTracks = await musicSourceManager.current.getExternalTracks(10);
        setTracks(prev => [...prev, ...moreTracks]);
        console.log(`Added ${moreTracks.length} more tracks`);
      } catch (error) {
        console.error('Error loading more tracks:', error);
      }
    }

    const nextTrack = tracks[currentTrackIndex.current];
    
    setRadioState(prev => ({
      ...prev,
      currentTrack: nextTrack,
      history: prev.currentTrack ? [prev.currentTrack, ...prev.history].slice(0, 10) : prev.history,
      progress: 0
    }));

    console.log(`Next track: ${nextTrack.title} by ${nextTrack.artist}`);

    if (radioState.isPlaying && audioRef.current) {
      audioRef.current.src = nextTrack.stream_url;
      setTimeout(() => {
        audioRef.current?.play().catch(console.error);
      }, 100);
    }
  }, [tracks, radioState.isPlaying]);

  const previousTrack = useCallback(() => {
    if (radioState.history.length > 0) {
      const previousTrack = radioState.history[0];
      
      // Type guard to ensure it's a track (not an ad or dj talk)
      if ('title' in previousTrack && 'artist' in previousTrack) {
        setRadioState(prev => ({
          ...prev,
          currentTrack: previousTrack,
          history: prev.history.slice(1),
          progress: 0
        }));

        if (radioState.isPlaying && audioRef.current) {
          const trackUrl = getTrackUrl(previousTrack);
          audioRef.current.src = trackUrl;
          setTimeout(() => {
            audioRef.current?.play().catch(console.error);
          }, 100);
        }
      }
    }
  }, [radioState.history, radioState.isPlaying]);

  const simulateDJTalk = useCallback(() => {
    setRadioState(prev => ({ ...prev, djActive: true }));
    
    // Simulate DJ talk for 10 seconds
    setTimeout(() => {
      setRadioState(prev => ({ ...prev, djActive: false }));
    }, 10000);
  }, []);

  return {
    radioState,
    togglePlay,
    setVolume,
    nextTrack,
    previousTrack,
    simulateDJTalk
  };
};
