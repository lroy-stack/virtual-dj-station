
import { useState, useCallback, useRef, useEffect } from 'react';
import { RadioState, Track, Advertisement, DJTalk } from '@/types';

const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Electronic Vibes',
    artist_id: 'artist1',
    duration: 180,
    file_url: '/audio/sample.mp3',
    artwork_url: '/images/album1.jpg',
    genre: 'Electronic',
    plays_count: 1250,
    priority_level: 3,
    upload_date: '2024-01-15',
    status: 'approved'
  },
  {
    id: '2',
    title: 'Midnight Jazz',
    artist: 'Smooth Operators',
    artist_id: 'artist2',
    duration: 240,
    file_url: '/audio/sample2.mp3',
    artwork_url: '/images/album2.jpg',
    genre: 'Jazz',
    plays_count: 890,
    priority_level: 2,
    upload_date: '2024-01-14',
    status: 'approved'
  }
];

export const useRadio = () => {
  const [radioState, setRadioState] = useState<RadioState>({
    isPlaying: false,
    currentTrack: MOCK_TRACKS[0],
    volume: 0.7,
    progress: 0,
    playlist: [],
    history: [],
    djActive: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndex = useRef(0);

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
    if (!audioRef.current) return;

    try {
      if (radioState.currentTrack && audioRef.current.src !== radioState.currentTrack.file_url) {
        audioRef.current.src = radioState.currentTrack.file_url;
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

  const nextTrack = useCallback(() => {
    currentTrackIndex.current = (currentTrackIndex.current + 1) % MOCK_TRACKS.length;
    const nextTrack = MOCK_TRACKS[currentTrackIndex.current];
    
    setRadioState(prev => ({
      ...prev,
      currentTrack: nextTrack,
      history: [prev.currentTrack, ...prev.history].filter(Boolean).slice(0, 10) as Track[],
      progress: 0
    }));

    if (radioState.isPlaying && audioRef.current) {
      audioRef.current.src = nextTrack.file_url;
      audioRef.current.play().catch(console.error);
    }
  }, [radioState.isPlaying]);

  const previousTrack = useCallback(() => {
    if (radioState.history.length > 0) {
      const previousTrack = radioState.history[0] as Track;
      setRadioState(prev => ({
        ...prev,
        currentTrack: previousTrack,
        history: prev.history.slice(1),
        progress: 0
      }));

      if (radioState.isPlaying && audioRef.current) {
        audioRef.current.src = previousTrack.file_url;
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
