
import { useCallback, useEffect, useRef } from 'react';
import { useRadioContext } from '@/contexts/RadioContext';
import { useAdvancedRadio } from '@/hooks/useAdvancedRadio';
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';

export const useSyncedRadio = (userTracks: Track[] = [], userTier: string = 'free') => {
  const { state, dispatch, emitEvent } = useRadioContext();
  const radioHook = useAdvancedRadio(userTracks, userTier);
  const previousTrack = useRef<Track | ExternalTrack | undefined>();
  const previousPlaying = useRef<boolean>(false);

  // Sync radio state with context
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: radioHook.radioState.currentTrack });
    dispatch({ type: 'SET_PLAYING', payload: radioHook.radioState.isPlaying });
    dispatch({ type: 'SET_VOLUME', payload: radioHook.radioState.volume });
    dispatch({ type: 'SET_PROGRESS', payload: radioHook.radioState.progress });
    dispatch({ type: 'SET_QUEUE', payload: radioHook.radioState.queue });
  }, [
    radioHook.radioState.currentTrack,
    radioHook.radioState.isPlaying,
    radioHook.radioState.volume,
    radioHook.radioState.progress,
    radioHook.radioState.queue,
    dispatch
  ]);

  // Emit events when state changes
  useEffect(() => {
    const currentTrack = radioHook.radioState.currentTrack;
    const isPlaying = radioHook.radioState.isPlaying;

    // Track changed
    if (currentTrack && currentTrack !== previousTrack.current) {
      if (previousTrack.current) {
        emitEvent({
          type: 'track_ended',
          data: { track: previousTrack.current },
          timestamp: Date.now()
        });
      }
      
      emitEvent({
        type: 'track_started',
        data: { track: currentTrack },
        timestamp: Date.now()
      });
      
      previousTrack.current = currentTrack;
    }

    // Playing state changed
    if (isPlaying !== previousPlaying.current) {
      emitEvent({
        type: isPlaying ? 'track_resumed' : 'track_paused',
        data: { track: currentTrack },
        timestamp: Date.now()
      });
      
      previousPlaying.current = isPlaying;
    }
  }, [radioHook.radioState.currentTrack, radioHook.radioState.isPlaying, emitEvent]);

  // Volume changed
  useEffect(() => {
    emitEvent({
      type: 'volume_changed',
      data: { volume: radioHook.radioState.volume },
      timestamp: Date.now()
    });
  }, [radioHook.radioState.volume, emitEvent]);

  // Enhanced controls that emit events
  const togglePlayWithEvent = useCallback(() => {
    radioHook.togglePlay();
  }, [radioHook]);

  const setVolumeWithEvent = useCallback((volume: number) => {
    radioHook.setVolume(volume);
  }, [radioHook]);

  const nextTrackWithEvent = useCallback(() => {
    if (radioHook.radioState.currentTrack) {
      emitEvent({
        type: 'track_ended',
        data: { track: radioHook.radioState.currentTrack, manual: true },
        timestamp: Date.now()
      });
    }
    radioHook.nextTrack();
  }, [radioHook, emitEvent]);

  const previousTrackWithEvent = useCallback(() => {
    radioHook.previousTrack();
  }, [radioHook]);

  // DJ Controls
  const pauseForDJ = useCallback(() => {
    if (radioHook.radioState.isPlaying) {
      radioHook.togglePlay();
      return true;
    }
    return false;
  }, [radioHook]);

  const resumeAfterDJ = useCallback(() => {
    if (!radioHook.radioState.isPlaying) {
      radioHook.togglePlay();
    }
  }, [radioHook]);

  const duckAudio = useCallback((duckLevel: number = 0.3) => {
    const originalVolume = radioHook.radioState.volume;
    radioHook.setVolume(originalVolume * duckLevel);
    return originalVolume;
  }, [radioHook]);

  const restoreAudio = useCallback((originalVolume: number) => {
    radioHook.setVolume(originalVolume);
  }, [radioHook]);

  return {
    ...radioHook,
    // Override with event-emitting versions
    togglePlay: togglePlayWithEvent,
    setVolume: setVolumeWithEvent,
    nextTrack: nextTrackWithEvent,
    previousTrack: previousTrackWithEvent,
    // DJ-specific controls
    pauseForDJ,
    resumeAfterDJ,
    duckAudio,
    restoreAudio,
    // Context state
    contextState: state
  };
};
