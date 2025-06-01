
import { useState, useCallback, useRef, useEffect } from 'react';
import { Track } from '@/types';
import { MusicSourceManager, QueueItem, ExternalTrack } from '@/services/MusicSourceManager';

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
}

export const useAdvancedRadio = (userTracks: Track[] = [], userTier: string = 'free') => {
  const [radioState, setRadioState] = useState<AdvancedRadioState>({
    isPlaying: false,
    currentTrack: undefined,
    volume: 0.7,
    progress: 0,
    queue: [],
    history: [],
    isLoading: false,
    crossfadeEnabled: true,
    crossfadeDuration: 3000,
    currentSource: 'user',
    bufferHealth: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicSourceManager = useRef(new MusicSourceManager());
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTrackIndex = useRef(0);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar reproductor
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
    audioRef.current.crossOrigin = 'anonymous';
    
    // Audio para crossfade
    nextAudioRef.current = new Audio();
    nextAudioRef.current.volume = 0;
    nextAudioRef.current.crossOrigin = 'anonymous';

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (audio.duration) {
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
      nextTrack();
    };

    const handleLoadStart = () => {
      setRadioState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setRadioState(prev => ({ ...prev, isLoading: false }));
      preloadNextTrack();
    };

    const handleError = (error: Event) => {
      console.error('Audio playback error:', error);
      setRadioState(prev => ({ ...prev, isLoading: false }));
      // Intentar siguiente pista automáticamente
      setTimeout(() => nextTrack(), 1000);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
  };

  const initializeQueue = async () => {
    setRadioState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Si hay tracks de usuario, usarlos como base
      let initialQueue: QueueItem[] = [];
      
      if (userTracks.length > 0) {
        initialQueue = musicSourceManager.current.generateQueue(userTracks, userTier);
      }
      
      // Llenar con contenido externo (incluso si no hay tracks de usuario)
      const fullQueue = await musicSourceManager.current.fillQueueWithExternal(initialQueue, 20);
      
      setRadioState(prev => ({
        ...prev,
        queue: fullQueue,
        currentTrack: fullQueue[0]?.track,
        currentSource: fullQueue[0]?.source || 'external',
        isLoading: false
      }));

      // Cargar primera pista
      if (fullQueue[0]?.track) {
        loadTrack(fullQueue[0].track);
      }
    } catch (error) {
      console.error('Error initializing queue:', error);
      setRadioState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadTrack = (track: Track | ExternalTrack) => {
    if (!audioRef.current) return;

    const url = 'file_url' in track ? track.file_url : track.stream_url;
    audioRef.current.src = url;
    
    setRadioState(prev => ({
      ...prev,
      currentTrack: track,
      currentSource: 'source' in track ? 'external' : 'user',
      progress: 0
    }));
  };

  const preloadNextTrack = () => {
    if (!nextAudioRef.current || radioState.queue.length < 2) return;

    const nextTrack = radioState.queue[1]?.track;
    if (nextTrack) {
      const url = 'file_url' in nextTrack ? nextTrack.file_url : nextTrack.stream_url;
      nextAudioRef.current.src = url;
      nextAudioRef.current.load();
      
      // Marcar como precargado
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

    // Iniciar reproducción de la siguiente pista
    nextAudioRef.current.currentTime = 0;
    nextAudioRef.current.play().catch(console.error);

    crossfadeTimeoutRef.current = setInterval(() => {
      if (!audioRef.current || !nextAudioRef.current) return;

      step++;
      const progress = step / steps;
      
      // Fade out audio actual, fade in siguiente
      audioRef.current.volume = radioState.volume * (1 - progress);
      nextAudioRef.current.volume = radioState.volume * progress;

      if (step >= steps) {
        // Completar transición
        if (crossfadeTimeoutRef.current) {
          clearInterval(crossfadeTimeoutRef.current);
          crossfadeTimeoutRef.current = null;
        }
        
        // Intercambiar referencias de audio
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
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setRadioState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

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

  const nextTrack = useCallback(() => {
    if (radioState.crossfadeEnabled && nextAudioRef.current?.readyState >= 2) {
      startCrossfade();
    } else {
      nextTrackInQueue();
    }
  }, [radioState.crossfadeEnabled]);

  const nextTrackInQueue = async () => {
    // Mover pista actual al historial
    if (radioState.currentTrack) {
      setRadioState(prev => ({
        ...prev,
        history: [prev.currentTrack!, ...prev.history].slice(0, 20)
      }));
    }

    // Remover primera pista de la cola
    const newQueue = radioState.queue.slice(1);
    
    // Llenar cola si está baja
    let updatedQueue = newQueue;
    if (newQueue.length < 5) {
      try {
        updatedQueue = await musicSourceManager.current.fillQueueWithExternal(newQueue, 20);
      } catch (error) {
        console.error('Error refilling queue:', error);
      }
    }

    setRadioState(prev => ({
      ...prev,
      queue: updatedQueue,
      progress: 0
    }));

    // Cargar siguiente pista
    if (updatedQueue[0]?.track) {
      loadTrack(updatedQueue[0].track);
      
      if (radioState.isPlaying && audioRef.current) {
        audioRef.current.play().catch(console.error);
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
        progress: 0
      }));

      loadTrack(previousTrack);
      
      if (radioState.isPlaying && audioRef.current) {
        audioRef.current.play().catch(console.error);
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
        progress: 0
      }));

      if (newQueue[0]?.track) {
        loadTrack(newQueue[0].track);
        
        if (radioState.isPlaying && audioRef.current) {
          audioRef.current.play().catch(console.error);
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
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    if (audioRef.current) {
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
