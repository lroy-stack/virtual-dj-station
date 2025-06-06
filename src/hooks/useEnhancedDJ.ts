
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';

interface DJPreferences {
  dj_enabled: boolean;
  dj_frequency: 'low' | 'medium' | 'high';
  dj_personality: 'enthusiastic' | 'friendly' | 'professional' | 'casual';
  voice_id: string;
  announcement_types: string[];
}

interface DJState {
  isActive: boolean;
  isSpeaking: boolean;
  lastAnnouncement: number;
  preferences: DJPreferences | null;
}

export const useEnhancedDJ = () => {
  const { user, userProfile } = useAuth();
  const [djState, setDjState] = useState<DJState>({
    isActive: false,
    isSpeaking: false,
    lastAnnouncement: 0,
    preferences: null
  });
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Fetch DJ preferences
  useEffect(() => {
    if (user) {
      fetchDJPreferences();
    }
  }, [user]);

  const fetchDJPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('dj_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setDjState(prev => ({ ...prev, preferences: data }));
      }
    } catch (error) {
      console.error('Error fetching DJ preferences:', error);
    }
  };

  const generateDJAnnouncement = async (
    type: 'track_intro' | 'track_outro' | 'general',
    track?: Track | ExternalTrack,
    context?: string
  ) => {
    if (!djState.preferences || !user) return null;

    try {
      const response = await supabase.functions.invoke('generate-dj-voice', {
        body: {
          type,
          track,
          context,
          personality: djState.preferences.dj_personality,
          voice_id: djState.preferences.voice_id,
          user_profile: userProfile
        }
      });

      if (response.data?.audio_url) {
        return response.data.audio_url;
      }
    } catch (error) {
      console.error('Error generating DJ announcement:', error);
    }

    return null;
  };

  const playDJAnnouncement = async (audioUrl: string) => {
    try {
      setDjState(prev => ({ ...prev, isSpeaking: true }));
      
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setDjState(prev => ({ ...prev, isSpeaking: false }));
        setCurrentAudio(null);
      };

      await audio.play();
      
      setDjState(prev => ({ ...prev, lastAnnouncement: Date.now() }));
    } catch (error) {
      console.error('Error playing DJ announcement:', error);
      setDjState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const shouldAnnounce = (type: string): boolean => {
    if (!djState.preferences?.dj_enabled) return false;
    if (!djState.preferences.announcement_types.includes(type)) return false;

    const now = Date.now();
    const timeSinceLastAnnouncement = now - djState.lastAnnouncement;
    
    // Frequency-based intervals
    const intervals = {
      low: 10 * 60 * 1000,    // 10 minutes
      medium: 5 * 60 * 1000,   // 5 minutes
      high: 2 * 60 * 1000      // 2 minutes
    };

    const minInterval = intervals[djState.preferences.dj_frequency];
    return timeSinceLastAnnouncement >= minInterval;
  };

  const announceTrack = async (track: Track | ExternalTrack, type: 'intro' | 'outro') => {
    if (!shouldAnnounce(`track_${type}`)) return;

    const audioUrl = await generateDJAnnouncement(`track_${type}` as any, track);
    if (audioUrl) {
      await playDJAnnouncement(audioUrl);
    }
  };

  const announceGeneral = async (context: string) => {
    if (!shouldAnnounce('general')) return;

    const audioUrl = await generateDJAnnouncement('general', undefined, context);
    if (audioUrl) {
      await playDJAnnouncement(audioUrl);
    }
  };

  const updatePreferences = async (newPreferences: Partial<DJPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('dj_preferences')
        .update(newPreferences)
        .eq('user_id', user.id);

      if (!error) {
        setDjState(prev => ({
          ...prev,
          preferences: prev.preferences ? { ...prev.preferences, ...newPreferences } : null
        }));
      }
    } catch (error) {
      console.error('Error updating DJ preferences:', error);
    }
  };

  const stopCurrentAnnouncement = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setDjState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  return {
    djState,
    announceTrack,
    announceGeneral,
    updatePreferences,
    stopCurrentAnnouncement,
    isEligibleForDJ: userProfile?.subscription_type === 'premium' || userProfile?.subscription_type === 'free'
  };
};
