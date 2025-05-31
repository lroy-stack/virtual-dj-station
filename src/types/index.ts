
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_end?: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'free' | 'artist_basic' | 'artist_premium' | 'advertiser_basic' | 'advertiser_premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete';
export type UserRole = 'listener' | 'artist' | 'advertiser';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artist_id: string;
  duration: number;
  file_url: string;
  artwork_url?: string;
  genre?: string;
  plays_count: number;
  priority_level: number;
  upload_date: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: {
    bpm?: number;
    key?: string;
    mood?: string;
  };
}

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  advertiser_id: string;
  audio_url: string;
  duration: number;
  voice_id: string;
  priority_level: number;
  plays_count: number;
  target_plays: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  expires_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  id: string;
  type: 'track' | 'ad' | 'dj_talk';
  content_id: string;
  scheduled_at: string;
  played_at?: string;
  duration: number;
}

export interface DJTalk {
  id: string;
  content: string;
  voice_id: string;
  audio_url: string;
  duration: number;
  context: string;
  created_at: string;
}

export interface AudioVisualizerData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  volume: number;
}

export interface RadioState {
  isPlaying: boolean;
  currentTrack?: Track;
  currentAd?: Advertisement;
  currentDJTalk?: DJTalk;
  volume: number;
  progress: number;
  playlist: PlaylistItem[];
  history: (Track | Advertisement | DJTalk)[];
  djActive: boolean;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface Statistics {
  totalPlays: number;
  uniqueListeners: number;
  averageListeningTime: number;
  topTracks: Track[];
  recentActivity: {
    date: string;
    plays: number;
    listeners: number;
  }[];
}

export interface NotificationSettings {
  email_new_uploads: boolean;
  email_play_milestones: boolean;
  email_subscription_updates: boolean;
  push_now_playing: boolean;
  push_subscription_reminders: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  autoplay: boolean;
  notifications: NotificationSettings;
}
