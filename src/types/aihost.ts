
export interface AIHostState {
  isActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  currentContent: ContentItem | null;
  mood: 'neutral' | 'happy' | 'excited' | 'calm' | 'energetic';
  energy: number; // 0-100
}

export interface ContentItem {
  id: string;
  type: 'song_intro' | 'advertisement' | 'user_response' | 'announcement' | 'weather' | 'time' | 'custom';
  content: string;
  duration: number; // in milliseconds
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    voiceId?: string;
    emotion?: string;
    speed?: number;
  };
}

export type HostMode = 'full' | 'minimized' | 'overlay' | 'mobile';

export interface VoiceSettings {
  voiceId: string;
  volume: number;
  speed: number;
  pitch: number;
  emotion: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'host';
  timestamp: Date;
  type?: 'message' | 'suggestion' | 'system';
}

export interface HostPersonality {
  name: string;
  description: string;
  traits: string[];
  preferredTopics: string[];
  responseStyle: 'formal' | 'casual' | 'energetic' | 'calm';
}
