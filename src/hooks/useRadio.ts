
import { useState, useCallback, useRef, useEffect } from 'react';
import { RadioState, Track, Advertisement, DJTalk } from '@/types';
import { MusicSourceManager, ExternalTrack } from '@/services/MusicSourceManager';

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

  // Initialize with real Jamendo tracks
  useEffect(() => {
    const loadInitialTracks = async () => {
      try {
        const jamendoTracks = await musicSourceManager.current.getExternalTracks(10);
        setTracks(jamendoTracks);
        
        if (jamendoTracks.length > 0) {
          setRadioState(prev => ({
            ...prev,
            currentTrack: jamendoTracks[0]
          }));
        }
      } catch (error) {
        console.error('Error loading initial tracks:', error);
      }
    };

    loadInitialTracks();
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = radioState.volume;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setRadioState(prev => ({
          ...prev,
          progress: (audio.currentTime / audio.duration) * 100
        }));
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    const handleLoadStart = () => {
      console.log('Loading audio...');
    };

    const handleCanPlay = () => {
      console.log('Audio ready to play');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current || !radioState.currentTrack) return;

    try {
      const streamUrl = radioState.currentTrack.stream_url;
      if (audioRef.current.src !== streamUrl) {
        audioRef.current.src = streamUrl;
      }
      
      await audioRef.current.play();
      setRadioState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [radioState.currentTrack]);

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
        const moreTracks = await musicSourceManager.current.getExternalTracks(10);
        setTracks(prev => [...prev, ...moreTracks]);
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

    if (radioState.isPlaying && audioRef.current) {
      audioRef.current.src = nextTrack.stream_url;
      audioRef.current.play().catch(console.error);
    }
  }, [tracks, radioState.isPlaying]);

  const previousTrack = useCallback(() => {
    if (radioState.history.length > 0) {
      const previousTrack = radioState.history[0] as ExternalTrack;
      setRadioState(prev => ({
        ...prev,
        currentTrack: previousTrack,
        history: prev.history.slice(1),
        progress: 0
      }));

      if (radioState.isPlaying && audioRef.current) {
        audioRef.current.src = previousTrack.stream_url;
        audioRef.current.play().catch(console.error);
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
