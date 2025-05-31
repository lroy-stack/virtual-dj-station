
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIHostState } from '@/types/aihost';

interface HostAvatarProps {
  state: AIHostState;
  size?: 'sm' | 'md' | 'lg';
  showWaves?: boolean;
  onAvatarClick?: () => void;
}

const HostAvatar: React.FC<HostAvatarProps> = ({
  state,
  size = 'md',
  showWaves = false,
  onAvatarClick
}) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const getAvatarColor = () => {
    switch (state.mood) {
      case 'happy': return 'from-yellow-400 to-orange-500';
      case 'excited': return 'from-pink-400 to-red-500';
      case 'calm': return 'from-blue-400 to-indigo-500';
      case 'energetic': return 'from-green-400 to-cyan-500';
      default: return 'from-primary to-secondary';
    }
  };

  const getEyeState = () => {
    if (state.isSpeaking) return '◔ ◔'; // Speaking eyes
    if (state.isThinking) return '◐ ◑'; // Thinking eyes
    if (state.isListening) return '◉ ◉'; // Listening eyes
    return '● ●'; // Normal eyes
  };

  const getMouthState = () => {
    if (state.isSpeaking) {
      // Animate mouth for speaking
      const shapes = ['○', '◯', '○', '◯'];
      return shapes[animationFrame % shapes.length];
    }
    if (state.mood === 'happy') return '◡';
    if (state.mood === 'excited') return '◔';
    return '◇';
  };

  // Animation loop for speaking
  useEffect(() => {
    if (state.isSpeaking) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [state.isSpeaking]);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Avatar Container */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={onAvatarClick}
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            bg-gradient-to-br ${getAvatarColor()}
            hover:scale-105 
            transition-all 
            duration-300 
            p-0
            ${state.isActive ? 'glow' : ''}
            ${state.isSpeaking ? 'animate-pulse-glow' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center text-white space-y-1">
            {/* Eyes */}
            <div className="text-lg font-bold tracking-wider">
              {getEyeState()}
            </div>
            {/* Mouth */}
            <div className="text-sm">
              {getMouthState()}
            </div>
          </div>
        </Button>

        {/* Activity Indicator */}
        {state.isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}

        {/* Voice Waves */}
        {showWaves && state.isSpeaking && (
          <div className="absolute -inset-4 flex items-center justify-center">
            <div className="flex items-end space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="audio-bar bg-gradient-to-t from-primary to-secondary"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <div className={`text-sm font-medium transition-colors ${
          state.isActive ? 'text-green-500' : 'text-muted-foreground'
        }`}>
          {state.isSpeaking ? 'Hablando' :
           state.isThinking ? 'Pensando...' :
           state.isListening ? 'Escuchando' :
           state.isActive ? 'En vivo' : 'Inactivo'}
        </div>
        
        {size === 'lg' && (
          <div className="text-xs text-muted-foreground mt-1">
            Energía: {state.energy}%
          </div>
        )}
      </div>

      {/* Mood Indicator */}
      {size === 'lg' && state.mood !== 'neutral' && (
        <div className="text-xs text-muted-foreground capitalize bg-accent px-2 py-1 rounded-full">
          {state.mood}
        </div>
      )}
    </div>
  );
};

export default HostAvatar;
