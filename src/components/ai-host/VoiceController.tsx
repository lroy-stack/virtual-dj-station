
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward,
  Mic,
  Settings,
  Waveform
} from 'lucide-react';
import { ContentItem } from '@/types/aihost';

interface VoiceControllerProps {
  isActive: boolean;
  isSpeaking: boolean;
  currentContent: ContentItem | null;
  onToggleActivity: () => void;
}

const VoiceController: React.FC<VoiceControllerProps> = ({
  isActive,
  isSpeaking,
  currentContent,
  onToggleActivity
}) => {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceType, setVoiceType] = useState('Clara');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const voiceOptions = [
    { name: 'Clara', description: 'Voz femenina clara y profesional' },
    { name: 'David', description: 'Voz masculina cálida y amigable' },
    { name: 'Sofia', description: 'Voz femenina joven y energética' },
    { name: 'Roberto', description: 'Voz masculina profunda y tranquila' }
  ];

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'song_intro': return 'Presentación';
      case 'advertisement': return 'Anuncio';
      case 'user_response': return 'Respuesta';
      case 'weather': return 'Clima';
      case 'time': return 'Hora';
      default: return 'Contenido';
    }
  };

  const getContentProgress = () => {
    if (!currentContent || !isSpeaking) return 0;
    // Simulate progress - in real implementation, this would track actual speech progress
    return Math.random() * 100;
  };

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Waveform className="w-4 h-4" />
            <span>Control de Voz</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onToggleActivity}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={isActive ? "radio-gradient" : ""}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isActive ? 'Desactivar' : 'Activar'}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              disabled={!isActive}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                disabled={!isActive}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Current Content Display */}
        {currentContent && isSpeaking && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {getContentTypeLabel(currentContent.type)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {Math.ceil(currentContent.duration / 1000)}s
              </span>
            </div>
            
            <div className="p-3 bg-accent/30 rounded-lg">
              <p className="text-sm text-foreground mb-2">{currentContent.content}</p>
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="radio-gradient h-1 rounded-full transition-all duration-300"
                  style={{ width: `${getContentProgress()}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Voz del Locutor</label>
          <div className="grid grid-cols-2 gap-2">
            {voiceOptions.map((voice) => (
              <Button
                key={voice.name}
                variant={voiceType === voice.name ? "default" : "outline"}
                size="sm"
                onClick={() => setVoiceType(voice.name)}
                className="text-xs h-auto p-2"
                disabled={!isActive}
              >
                <div className="text-center">
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-xs opacity-70">{voice.description.split(' ')[0]}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Velocidad de Habla: {speechSpeed.toFixed(1)}x
              </label>
              <Slider
                value={[speechSpeed]}
                onValueChange={(value) => setSpeechSpeed(value[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={!isActive}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Modo ElevenLabs</span>
              <Badge variant="secondary">Preparado</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calidad de Voz</span>
              <Badge variant="outline">Alta</Badge>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="text-center">
          <div className={`text-sm font-medium ${
            isSpeaking ? 'text-green-500' :
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {isSpeaking ? 'Reproduciendo voz...' :
             isActive ? 'Listo para hablar' : 'Locutor inactivo'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceController;
