
import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';

export interface RadioEvent {
  type: 'track_started' | 'track_ended' | 'track_paused' | 'track_resumed' | 'track_error' | 'volume_changed' | 'queue_updated';
  data?: any;
  timestamp: number;
}

export interface RadioContextState {
  currentTrack?: Track | ExternalTrack;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: any[];
  listeners: RadioEventListener[];
  djActive: boolean;
  djSpeaking: boolean;
  djVolume: number;
}

interface RadioEventListener {
  id: string;
  callback: (event: RadioEvent) => void;
}

interface RadioContextValue {
  state: RadioContextState;
  dispatch: React.Dispatch<RadioAction>;
  addEventListener: (id: string, callback: (event: RadioEvent) => void) => void;
  removeEventListener: (id: string) => void;
  emitEvent: (event: RadioEvent) => void;
  setDJActive: (active: boolean) => void;
  setDJSpeaking: (speaking: boolean) => void;
  setDJVolume: (volume: number) => void;
}

type RadioAction = 
  | { type: 'SET_CURRENT_TRACK'; payload: Track | ExternalTrack | undefined }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_QUEUE'; payload: any[] }
  | { type: 'SET_DJ_ACTIVE'; payload: boolean }
  | { type: 'SET_DJ_SPEAKING'; payload: boolean }
  | { type: 'SET_DJ_VOLUME'; payload: number }
  | { type: 'ADD_LISTENER'; payload: RadioEventListener }
  | { type: 'REMOVE_LISTENER'; payload: string };

const initialState: RadioContextState = {
  currentTrack: undefined,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  queue: [],
  listeners: [],
  djActive: false,
  djSpeaking: false,
  djVolume: 0.8
};

function radioReducer(state: RadioContextState, action: RadioAction): RadioContextState {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_DJ_ACTIVE':
      return { ...state, djActive: action.payload };
    case 'SET_DJ_SPEAKING':
      return { ...state, djSpeaking: action.payload };
    case 'SET_DJ_VOLUME':
      return { ...state, djVolume: action.payload };
    case 'ADD_LISTENER':
      return { ...state, listeners: [...state.listeners, action.payload] };
    case 'REMOVE_LISTENER':
      return { ...state, listeners: state.listeners.filter(l => l.id !== action.payload) };
    default:
      return state;
  }
}

const RadioContext = createContext<RadioContextValue | undefined>(undefined);

export const useRadioContext = () => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadioContext must be used within a RadioProvider');
  }
  return context;
};

export const RadioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(radioReducer, initialState);

  const addEventListener = (id: string, callback: (event: RadioEvent) => void) => {
    dispatch({ type: 'ADD_LISTENER', payload: { id, callback } });
  };

  const removeEventListener = (id: string) => {
    dispatch({ type: 'REMOVE_LISTENER', payload: id });
  };

  const emitEvent = (event: RadioEvent) => {
    state.listeners.forEach(listener => {
      try {
        listener.callback(event);
      } catch (error) {
        console.error('Error in radio event listener:', error);
      }
    });
  };

  const setDJActive = (active: boolean) => {
    dispatch({ type: 'SET_DJ_ACTIVE', payload: active });
    emitEvent({
      type: active ? 'track_started' : 'track_paused',
      data: { djActive: active },
      timestamp: Date.now()
    });
  };

  const setDJSpeaking = (speaking: boolean) => {
    dispatch({ type: 'SET_DJ_SPEAKING', payload: speaking });
  };

  const setDJVolume = (volume: number) => {
    dispatch({ type: 'SET_DJ_VOLUME', payload: volume });
  };

  return (
    <RadioContext.Provider value={{
      state,
      dispatch,
      addEventListener,
      removeEventListener,
      emitEvent,
      setDJActive,
      setDJSpeaking,
      setDJVolume
    }}>
      {children}
    </RadioContext.Provider>
  );
};
