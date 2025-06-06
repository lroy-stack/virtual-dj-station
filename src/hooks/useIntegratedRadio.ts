
import { useCallback, useEffect, useRef } from 'react';
import { useSyncedRadio } from '@/hooks/useSyncedRadio';
import { useEnhancedDJ } from '@/hooks/useEnhancedDJ';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';

export const useIntegratedRadio = () => {
  const { user, userProfile } = useAuth();
  const radio = useSyncedRadio([], userProfile?.subscription_type || 'free');
  const dj = useEnhancedDJ();
  const previousTrack = useRef<Track | ExternalTrack | undefined>();
  const adCountRef = useRef(0);

  // DJ Integration with Radio Events
  useEffect(() => {
    const currentTrack = radio.radioState.currentTrack;
    
    // Track started - DJ intro (for premium users or occasional for free users)
    if (currentTrack && currentTrack !== previousTrack.current) {
      const shouldIntroduce = userProfile?.subscription_type === 'premium' || 
                             Math.random() < 0.3; // 30% chance for free users
      
      if (shouldIntroduce) {
        setTimeout(() => {
          dj.announceTrack(currentTrack, 'intro');
        }, 1000); // Slight delay to let music start
      }
      
      // Track ended - DJ outro
      if (previousTrack.current) {
        dj.announceTrack(previousTrack.current, 'outro');
      }
      
      previousTrack.current = currentTrack;
    }
  }, [radio.radioState.currentTrack, dj, userProfile]);

  // Ad insertion logic for free users
  useEffect(() => {
    if (userProfile?.subscription_type === 'free' && radio.radioState.currentTrack) {
      adCountRef.current++;
      
      // Insert ad every 3-4 songs for free users
      if (adCountRef.current >= 3) {
        setTimeout(() => {
          dj.announceGeneral('Y ahora un breve mensaje de nuestros patrocinadores');
          // Here you would insert actual ad content
        }, 2000);
        adCountRef.current = 0;
      }
    }
  }, [radio.radioState.currentTrack, userProfile, dj]);

  // Audio ducking when DJ speaks
  const originalVolume = useRef(radio.radioState.volume);
  
  useEffect(() => {
    if (dj.djState.isSpeaking) {
      // Duck audio to 30% when DJ is speaking
      originalVolume.current = radio.radioState.volume;
      radio.setVolume(radio.radioState.volume * 0.3);
    } else if (originalVolume.current) {
      // Restore original volume when DJ stops speaking
      radio.setVolume(originalVolume.current);
    }
  }, [dj.djState.isSpeaking, radio]);

  // Enhanced controls that work with DJ
  const enhancedTogglePlay = useCallback(() => {
    if (dj.djState.isSpeaking) {
      dj.stopCurrentAnnouncement();
    }
    radio.togglePlay();
  }, [radio, dj]);

  const enhancedNextTrack = useCallback(() => {
    if (dj.djState.isSpeaking) {
      dj.stopCurrentAnnouncement();
    }
    radio.nextTrack();
  }, [radio, dj]);

  const enhancedPreviousTrack = useCallback(() => {
    if (dj.djState.isSpeaking) {
      dj.stopCurrentAnnouncement();
    }
    radio.previousTrack();
  }, [radio, dj]);

  // Premium features
  const requestSong = useCallback(async (message: string) => {
    if (userProfile?.subscription_type === 'premium') {
      await dj.announceGeneral(`Tenemos una petición: ${message}`);
    }
  }, [dj, userProfile]);

  const toggleDJ = useCallback(async (enabled: boolean) => {
    await dj.updatePreferences({ dj_enabled: enabled });
  }, [dj]);

  return {
    // Radio controls
    ...radio,
    togglePlay: enhancedTogglePlay,
    nextTrack: enhancedNextTrack,
    previousTrack: enhancedPreviousTrack,
    
    // DJ state and controls
    djState: dj.djState,
    updateDJPreferences: dj.updatePreferences,
    requestSong,
    toggleDJ,
    
    // User state
    userProfile,
    isPremium: userProfile?.subscription_type === 'premium',
    isEligibleForDJ: dj.isEligibleForDJ
  };
};
