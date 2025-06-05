
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRadioContext, RadioEvent } from '@/contexts/RadioContext';
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';
import { AIHostState, ContentItem } from '@/types/aihost';

interface DJContent {
  id: string;
  text: string;
  type: 'intro' | 'outro' | 'interlude' | 'announcement';
  duration: number;
  priority: number;
}

export const useSyncedDJ = () => {
  const { state, addEventListener, removeEventListener, setDJActive, setDJSpeaking, setDJVolume } = useRadioContext();
  const [djState, setDjState] = useState<AIHostState>({
    isActive: false,
    isSpeaking: false,
    isListening: false,
    isThinking: false,
    currentContent: null,
    mood: 'neutral',
    energy: 50
  });

  const [contentQueue, setContentQueue] = useState<ContentItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const duckingRef = useRef<{ originalVolume: number; isDucked: boolean }>({ originalVolume: 0.7, isDucked: false });

  // Initialize DJ event listeners
  useEffect(() => {
    if (isInitialized) return;

    const handleRadioEvent = (event: RadioEvent) => {
      console.log('DJ received radio event:', event.type, event.data);
      
      switch (event.type) {
        case 'track_started':
          handleTrackStarted(event.data?.track);
          break;
        case 'track_ended':
          handleTrackEnded(event.data?.track, event.data?.manual);
          break;
        case 'track_paused':
          handleTrackPaused();
          break;
        case 'track_resumed':
          handleTrackResumed();
          break;
        case 'volume_changed':
          handleVolumeChanged(event.data?.volume);
          break;
      }
    };

    addEventListener('dj-sync', handleRadioEvent);
    setIsInitialized(true);

    return () => {
      removeEventListener('dj-sync');
    };
  }, [isInitialized, addEventListener, removeEventListener]);

  const handleTrackStarted = (track: Track | ExternalTrack) => {
    if (!track || !djState.isActive) return;

    const introContent = generateTrackIntro(track);
    if (introContent) {
      queueContent(introContent);
    }
  };

  const handleTrackEnded = (track: Track | ExternalTrack, manual?: boolean) => {
    if (!track || !djState.isActive) return;

    // If manually skipped, don't add outro
    if (manual) return;

    const outroContent = generateTrackOutro(track);
    if (outroContent) {
      queueContent(outroContent);
    }
  };

  const handleTrackPaused = () => {
    // DJ could announce pause or stay quiet
  };

  const handleTrackResumed = () => {
    // DJ could welcome back or stay quiet
  };

  const handleVolumeChanged = (volume: number) => {
    // Adjust DJ volume relative to music volume
    setDJVolume(Math.min(volume * 1.2, 1.0));
  };

  const generateTrackIntro = (track: Track | ExternalTrack): ContentItem | null => {
    const isUserTrack = 'file_url' in track;
    const genre = track.genre || 'música';
    
    const intros = [
      `¡Excelente! Ahora suena "${track.title}" de ${track.artist}. Una verdadera joya de ${genre}.`,
      `Continuamos con "${track.title}" por ${track.artist}. El ritmo perfecto para este momento.`,
      `Desde ${isUserTrack ? 'nuestros artistas locales' : 'Jamendo'}, "${track.title}" de ${track.artist}.`,
      `¡Atención! Esta es "${track.title}" de ${track.artist}. Una canción que no puedes perderte.`,
      `En Radio IA, "${track.title}" por ${track.artist}. La música independiente en su máxima expresión.`
    ];

    const randomIntro = intros[Math.floor(Math.random() * intros.length)];

    return {
      id: `intro-${track.id || Date.now()}`,
      type: 'song_intro',
      content: randomIntro,
      duration: 6000,
      priority: 'high',
      metadata: {
        voiceId: 'default',
        emotion: 'enthusiastic',
        speed: 1.0
      }
    };
  };

  const generateTrackOutro = (track: Track | ExternalTrack): ContentItem | null => {
    const outros = [
      `Esa fue "${track.title}" de ${track.artist}. ¡Qué gran tema!`,
      `"${track.title}" por ${track.artist}. La música sigue aquí en Radio IA.`,
      `Terminamos "${track.title}" de ${track.artist}. Continuamos con más música increíble.`
    ];

    const randomOutro = outros[Math.floor(Math.random() * outros.length)];

    return {
      id: `outro-${track.id || Date.now()}`,
      type: 'announcement',
      content: randomOutro,
      duration: 4000,
      priority: 'medium',
      metadata: {
        voiceId: 'default',
        emotion: 'satisfied',
        speed: 1.0
      }
    };
  };

  const queueContent = (content: ContentItem) => {
    setContentQueue(prev => {
      const newQueue = [...prev, content].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      return newQueue;
    });
  };

  const processContentQueue = useCallback(async () => {
    if (contentQueue.length === 0 || djState.isSpeaking) return;

    const nextContent = contentQueue[0];
    setContentQueue(prev => prev.slice(1));

    // Duck the music audio
    duckingRef.current.originalVolume = state.volume;
    duckingRef.current.isDucked = true;

    setDjState(prev => ({
      ...prev,
      isSpeaking: true,
      currentContent: nextContent
    }));
    setDJSpeaking(true);

    // Simulate speaking (in real implementation, this would trigger TTS)
    console.log(`DJ Speaking: ${nextContent.content}`);

    setTimeout(() => {
      setDjState(prev => ({
        ...prev,
        isSpeaking: false,
        currentContent: null
      }));
      setDJSpeaking(false);

      // Restore audio volume
      if (duckingRef.current.isDucked) {
        duckingRef.current.isDucked = false;
      }
    }, nextContent.duration);
  }, [contentQueue, djState.isSpeaking, state.volume, setDJSpeaking]);

  // Process queue periodically
  useEffect(() => {
    const interval = setInterval(processContentQueue, 1000);
    return () => clearInterval(interval);
  }, [processContentQueue]);

  const toggleDJActive = useCallback(() => {
    const newActive = !djState.isActive;
    setDjState(prev => ({ ...prev, isActive: newActive }));
    setDJActive(newActive);

    if (newActive && state.currentTrack) {
      // DJ just activated, introduce current track
      queueContent({
        id: `activation-${Date.now()}`,
        type: 'announcement',
        content: `¡Hola! Soy tu locutor IA y estoy aquí para acompañarte. ${state.currentTrack ? `Actualmente suena "${state.currentTrack.title}" de ${state.currentTrack.artist}.` : 'Preparando música increíble para ti.'}`,
        duration: 5000,
        priority: 'high',
        metadata: {
          voiceId: 'default',
          emotion: 'friendly',
          speed: 1.0
        }
      });
    }
  }, [djState.isActive, setDJActive, state.currentTrack]);

  const addCustomAnnouncement = useCallback((message: string) => {
    queueContent({
      id: `custom-${Date.now()}`,
      type: 'announcement',
      content: message,
      duration: Math.max(3000, message.length * 80), // Rough estimate based on text length
      priority: 'medium',
      metadata: {
        voiceId: 'default',
        emotion: 'neutral',
        speed: 1.0
      }
    });
  }, []);

  return {
    djState,
    contentQueue,
    toggleDJActive,
    addCustomAnnouncement,
    isInitialized
  };
};
