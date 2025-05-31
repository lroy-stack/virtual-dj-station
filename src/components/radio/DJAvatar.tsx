
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface DJAvatarProps {
  isActive: boolean;
  onActivate: () => void;
}

const DJAvatar: React.FC<DJAvatarProps> = ({ isActive, onActivate }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onActivate}
        className={`relative transition-all duration-300 ${
          isActive 
            ? 'bg-primary/20 text-primary animate-pulse-glow' 
            : 'hover:bg-accent'
        }`}
      >
        {isActive ? (
          <Mic className="w-4 h-4" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
        
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </Button>

      <div className="hidden sm:flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? 'radio-gradient animate-float glow' 
            : 'bg-muted'
        }`}>
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            🎙️
          </div>
        </div>
        
        <div className="text-xs">
          <div className="font-medium">
            DJ IA
          </div>
          <div className={`transition-colors duration-300 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {isActive ? 'En vivo' : 'Inactivo'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DJAvatar;
