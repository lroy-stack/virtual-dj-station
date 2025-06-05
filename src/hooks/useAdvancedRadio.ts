
import { useState, useCallback, useRef, useEffect } from 'react';
import { Track } from '@/types';
import { MusicSourceManager, QueueItem, ExternalTrack } from '@/services/MusicSourceManager';
import { useToast } from '@/hooks/use-toast';

export interface AdvancedRadioState {
  isPlaying: boolean;
  currentTrack?: Track | ExternalTrack;
  volume: number;
  progress: number;
  queue: QueueItem[];
  history: (Track | ExternalTrack)[];
  isLoading: boolean;
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  currentSource: 'user' | 'external';
  bufferHealth: number;
  errorCount: number;
}

// Helper function to get audio URL consistently
const getAudioUrl = (track: Track | ExternalTrack): string => {
  return 'file_url' in track ? track.file_url : track.stream_url;
};

export const useAdvancedRadio = (userTracks: Track[] = [], userTier: string = 'free') => {
  const { toast } = useToast();
  
  const [radioState, setRadioState] = useState<AdvancedRadioState>({
    isPlaying: false,
    currentTrack: undefined,
    volume: 0.7,
    progress: 0,
    queue: [],
    history: [],
    isLoading: false,
    crossfadeEnabled: false,
    crossfadeDuration: 3000,
    currentSource: 'external',
    bufferHealth: 0,
    errorCount: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicSourceManager = useRef(new MusicSourceManager());
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handlersRef = useRef<{ [key: string]: (e: Event) => void }>({});

  useEffect(() => {
    initializePlayer();
    initializeQueue();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializePlayer = () => {
    // Audio principal
    audioRef.current = new Audio();
    audioRef.current.volume = radioState.volume;
    audioRef.current.crossOrigin = "anonymous";
    
    // Audio para crossfade
    nextAudioRef.current = new Audio();
    nextAudioRef.current.volume = 0;
    nextAudioRef.current.crossOrigin = "anonymous";

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const newProgress = (audio.currentTime / audio.duration) * 100;
        setRadioState(prev => ({
          ...prev,
          progress: newProgress,
          bufferHealth: audio.buffered.length > 0 ? 
            (audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100 : 0
        }));

        // Iniciar crossfade cerca del final
        if (radioState.crossfadeEnabled && 
            newProgress > 95 && 
            !crossfadeTimeoutRef.current) {
          startCrossfade();
        }
      }
    };

    const handleEnded = () => {
      console.log('Track ended, moving to next');
      nextTrack();
    };

    const handleLoadStart = () => {
      console.log('Audio loading started');
      setRadioState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      console.log('Audio ready to play');
      setRadioState(prev => ({ 
        ...prev, 
        isLoading: false,
        errorCount: 0
      }));
      preloadNextTrack();
    };

    const handleError = (error: Event) => {
      const audioError = (error.target as HTMLAudioElement)?.error;
      console.error('Audio playback error:', {
        error: audioError,
        code: audioError?.code,
        message: audioError?.message,
        currentSrc: audio.src,
        currentTrack: radioState.currentTrack?.title
      });
      
      setRadioState(prev => ({ 
        ...prev, 
        isLoading: false,
        errorCount: prev.errorCount + 1
      }));

      // Show user-friendly error message
      toast({
        title: "Error de reproducción",
        description: "Problema al cargar la música. Cambiando a la siguiente canción...",
        variant: "destructive",
      });

      // Evitar loop infinito de errores
      if (radioState.errorCount < 3) {
        console.log(`Retrying next track (attempt ${radioState.errorCount + 1}/3)`);
        retryTimeoutRef.current = setTimeout(() => {
          nextTrack();
        }, 2000);
      } else {
        console.error('Too many consecutive errors, stopping playback');
        toast({
          title: "Error persistente",
          description: "Múltiples errores de reproducción. Reiniciando sistema...",
          variant: "destructive",
        });
        setRadioState(prev => ({ 
          ...prev, 
          isPlaying: false,
          errorCount: 0
        }));
        
        // Restart with fresh content
        setTimeout(() => {
          initializeQueue();
        }, 3000);
      }
    };

    const handleLoadedData = () => {
      console.log('Audio data loaded successfully');
    };

    handlersRef.current = {
      timeupdate: handleTimeUpdate,
      ended: handleEnded,
      loadstart: handleLoadStart,
      canplay: handleCanPlay,
      error: handleError,
      loadeddata: handleLoadedData,
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);
  };

  const validateAudioUrl = async (url: string): Promise<boolean> => {
    try {
      // Basic URL validation
      if (!url || !url.startsWith('http')) {
        console.warn('Invalid URL format:', url);
        return false;
      }

      // Test if URL is reachable with HEAD request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors' // Allow cross-origin requests
        });
        clearTimeout(timeoutId);
        return true; // If no error thrown, assume it's valid
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // For CORS issues, we'll assume the URL might still work for audio
        if (url.includes('jamendo') || url.includes('.mp3')) {
          console.warn('CORS issue but might work for audio:', url);
          return true;
        }
        console.warn('URL validation failed:', url, fetchError);
        return false;
      }
    } catch (error) {
      console.warn('URL validation error:', error);
      return false;
    }
  };

  const initializeQueue = async () => {
    console.log('Initializing queue...');
    setRadioState(prev => ({ ...prev, isLoading: true }));
    
    try {
      let initialQueue: QueueItem[] = [];
      
      if (userTracks.length > 0) {
        console.log(`Adding ${userTracks.length} user tracks to queue`);
        initialQueue = musicSourceManager.current.generateQueue(userTracks, userTier);
      }
      
      console.log('Filling queue with external content...');
      const fullQueue = await musicSourceManager.current.fillQueueWithExternal(initialQueue, 20);
      
      if (fullQueue.length === 0) {
        throw new Error('No tracks available in queue');
      }

      // Validate first track URL
      const firstTrack = fullQueue[0]?.track;
      if (firstTrack) {
        const audioUrl = getAudioUrl(firstTrack);
        const isValid = await validateAudioUrl(audioUrl);
        if (!isValid) {
          console.warn('First track URL invalid, trying next...');
          // Remove invalid track and try next
          fullQueue.shift();
          if (fullQueue.length === 0) {
            throw new Error('No valid tracks available');
          }
        }
      }

      console.log(`Queue initialized with ${fullQueue.length} tracks`);
      console.log('First track in queue:', fullQueue[0]?.track);
      
      setRadioState(prev => ({
        ...prev,
        queue: fullQueue,
        currentTrack: fullQueue[0]?.track,
        currentSource: fullQueue[0]?.source || 'external',
        isLoading: false,
        errorCount: 0
      }));

      if (fullQueue[0]?.track) {
        loadTrack(fullQueue[0].track);
      }

      // Show success message
      toast({
        title: "Música cargada",
        description: `${fullQueue.length} canciones disponibles`,
      });

    } catch (error) {
      console.error('Error initializing queue:', error);
      toast({
        title: "Error de inicialización",
        description: "No se pudo cargar la música. Reintentando...",
        variant: "destructive",
      });
      setRadioState(prev => ({ ...prev, isLoading: false }));
      
      // Reintentar después de 5 segundos
      setTimeout(() => {
        initializeQueue();
      }, 5000);
    }
  };

  const loadTrack = async (track: Track | ExternalTrack) => {
    if (!audioRef.current) return;

    const url = getAudioUrl(track);
    console.log(`Loading track: "${track.title}" by ${track.artist}`);
    console.log(`URL: ${url}`);
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Validate URL before loading
    const isValid = await validateAudioUrl(url);
    if (!isValid) {
      console.error('Invalid URL, skipping track:', url);
      toast({
        title: "Canción no válida",
        description: "Saltando a la siguiente canción...",
        variant: "destructive",
      });
      nextTrack();
      return;
    }
    
    audioRef.current.src = url;
    
    setRadioState(prev => ({
      ...prev,
      currentTrack: track,
      currentSource: 'source' in track ? 'external' : 'user',
      progress: 0
    }));
  };

  const preloadNextTrack = () => {
    if (!radioState.crossfadeEnabled || !nextAudioRef.current || radioState.queue.length < 2) return;

    const nextTrack = radioState.queue[1]?.track;
    if (nextTrack) {
      const url = getAudioUrl(nextTrack);
      console.log(`Preloading next track: ${nextTrack.title}`);
      nextAudioRef.current.src = url;
      nextAudioRef.current.load();
      
      setRadioState(prev => ({
        ...prev,
        queue: prev.queue.map((item, index) => 
          index === 1 ? { ...item, preloaded: true } : item
        )
      }));
    }
  };

  const startCrossfade = () => {
    if (!radioState.crossfadeEnabled || !nextAudioRef.current || !audioRef.current) return;

    const fadeTime = radioState.crossfadeDuration;
    const steps = 50;
    const stepTime = fadeTime / steps;
    let step = 0;

    nextAudioRef.current.currentTime = 0;
    nextAudioRef.current.play().catch(console.error);

    crossfadeTimeoutRef.current = setInterval(() => {
      if (!audioRef.current || !nextAudioRef.current) return;

      step++;
      const progress = step / steps;
      
      audioRef.current.volume = radioState.volume * (1 - progress);
      nextAudioRef.current.volume = radioState.volume * progress;

      if (step >= steps) {
        if (crossfadeTimeoutRef.current) {
          clearInterval(crossfadeTimeoutRef.current);
          crossfadeTimeoutRef.current = null;
        }
        
        const temp = audioRef.current;
        audioRef.current = nextAudioRef.current;
        nextAudioRef.current = temp;
        
        nextAudioRef.current.pause();
        nextAudioRef.current.volume = 0;
        
        nextTrackInQueue();
      }
    }, stepTime);
  };

  const play = useCallback(async () => {
    if (!audioRef.current || !radioState.currentTrack) {
      console.warn('Cannot play: no audio element or current track');
      return;
    }

    try {
      console.log('Starting playback...');
      await audioRef.current.play();
      setRadioState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Error starting playback:', error);
      toast({
        title: "Error de reproducción",
        description: "No se pudo iniciar la reproducción",
        variant: "destructive",
      });
    }
  }, [radioState.currentTrack, toast]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      console.log('Pausing playback');
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

  const nextTrack = useCallback(() => {
    console.log('Moving to next track...');
    if (radioState.crossfadeEnabled && nextAudioRef.current?.readyState >= 2) {
      startCrossfade();
    } else {
      nextTrackInQueue();
    }
  }, [radioState.crossfadeEnabled]);

  const nextTrackInQueue = async () => {
    if (radioState.currentTrack) {
      setRadioState(prev => ({
        ...prev,
        history: [prev.currentTrack!, ...prev.history].slice(0, 20)
      }));
    }

    const newQueue = radioState.queue.slice(1);
    
    let updatedQueue = newQueue;
    if (newQueue.length < 5) {
      console.log('Queue running low, refilling...');
      try {
        updatedQueue = await musicSourceManager.current.fillQueueWithExternal(newQueue, 20);
      } catch (error) {
        console.error('Error refilling queue:', error);
      }
    }

    setRadioState(prev => ({
      ...prev,
      queue: updatedQueue,
      progress: 0,
      errorCount: 0
    }));

    if (updatedQueue[0]?.track) {
      loadTrack(updatedQueue[0].track);
      
      if (radioState.isPlaying && audioRef.current) {
        setTimeout(() => {
          audioRef.current?.play().catch(console.error);
        }, 100);
      }
    }
  };

  const previousTrack = useCallback(() => {
    if (radioState.history.length > 0) {
      const previousTrack = radioState.history[0];
      
      setRadioState(prev => ({
        ...prev,
        currentTrack: previousTrack,
        history: prev.history.slice(1),
        progress: 0,
        errorCount: 0
      }));

      loadTrack(previousTrack);
      
      if (radioState.isPlaying && audioRef.current) {
        setTimeout(() => {
          audioRef.current?.play().catch(console.error);
        }, 100);
      }
    }
  }, [radioState.history, radioState.isPlaying]);

  const skipToQueueItem = useCallback((index: number) => {
    if (index >= 0 && index < radioState.queue.length) {
      const newQueue = radioState.queue.slice(index);
      const skippedTracks = radioState.queue.slice(0, index);
      
      setRadioState(prev => ({
        ...prev,
        queue: newQueue,
        history: [...skippedTracks.map(item => item.track), ...prev.history].slice(0, 20),
        progress: 0,
        errorCount: 0
      }));

      if (newQueue[0]?.track) {
        loadTrack(newQueue[0].track);
        
        if (radioState.isPlaying && audioRef.current) {
          setTimeout(() => {
            audioRef.current?.play().catch(console.error);
          }, 100);
        }
      }
    }
  }, [radioState.queue, radioState.isPlaying]);

  const toggleCrossfade = useCallback(() => {
    setRadioState(prev => ({
      ...prev,
      crossfadeEnabled: !prev.crossfadeEnabled
    }));
  }, []);

  const setCrossfadeDuration = useCallback((duration: number) => {
    setRadioState(prev => ({
      ...prev,
      crossfadeDuration: Math.max(1000, Math.min(10000, duration))
    }));
  }, []);

  const cleanup = () => {
    if (crossfadeTimeoutRef.current) {
      clearInterval(crossfadeTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (audioRef.current) {
      const handlers = handlersRef.current;
      Object.entries(handlers).forEach(([event, fn]) => {
        audioRef.current?.removeEventListener(event, fn);
      });
      audioRef.current.pause();
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
    }
  };

  return {
    radioState,
    togglePlay,
    setVolume,
    nextTrack,
    previousTrack,
    skipToQueueItem,
    toggleCrossfade,
    setCrossfadeDuration,
    initializeQueue
  };
};
