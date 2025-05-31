
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  Heart,
  Share,
  Settings,
  Radio,
  Users,
  Globe,
  Shuffle
} from 'lucide-react';
import { useAdvancedRadio } from '@/hooks/useAdvancedRadio';
import AdvancedAudioVisualizer from './AdvancedAudioVisualizer';
import DJAvatar from './DJAvatar';

interface AdvancedAudioPlayerProps {
  userTracks?: any[];
  userTier?: string;
  onDJActivate?: () => void;
}

const AdvancedAudioPlayer: React.FC<AdvancedAudioPlayerProps> = ({ 
  userTracks = [],
  userTier = 'free',
  onDJActivate
}) => {
  const { 
    radioState, 
    togglePlay, 
    setVolume, 
    nextTrack, 
    previousTrack,
    toggleCrossfade,
    setCrossfadeDuration
  } = useAdvancedRadio(userTracks, userTier);

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(radioState.volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    if (!radioState.currentTrack) return 0;
    return (radioState.progress / 100) * radioState.currentTrack.duration;
  };

  const getSourceIcon = () => {
    return radioState.currentSource === 'user' ? <Users className="w-3 h-3" /> : <Globe className="w-3 h-3" />;
  };

  const getSourceLabel = () => {
    return radioState.currentSource === 'user' ? 'Usuario' : 'Externa';
  };

  const getAttribution = () => {
    if (radioState.currentSource === 'external' && radioState.currentTrack && 'attribution' in radioState.currentTrack) {
      return radioState.currentTrack.attribution;
    }
    return null;
  };

  return (
    <Card className="bg-card/90 backdrop-blur-md border border-border/50 p-6 sticky bottom-0 z-40 shadow-2xl">
      <div className="flex flex-col space-y-4">
        
        {/* Barra superior con información de fuente y estadísticas */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              {getSourceIcon()}
              <span>Fuente: {getSourceLabel()}</span>
            </Badge>
            
            {radioState.crossfadeEnabled && (
              <Badge variant="secondary" className="text-xs">
                Crossfade: {radioState.crossfadeDuration / 1000}s
              </Badge>
            )}
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Radio className="w-3 h-3" />
              <span>En cola: {radioState.queue.length}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {/* Panel de configuración (colapsible) */}
        {showSettings && (
          <div className="p-3 bg-accent/30 rounded-lg space-y-3 border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Crossfade</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCrossfade}
                className="h-6 text-xs"
              >
                {radioState.crossfadeEnabled ? 'Activado' : 'Desactivado'}
              </Button>
            </div>
            
            {radioState.crossfadeEnabled && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Duración: {radioState.crossfadeDuration / 1000}s
                </label>
                <Slider
                  value={[radioState.crossfadeDuration]}
                  onValueChange={(value) => setCrossfadeDuration(value[0])}
                  min={1000}
                  max={10000}
                  step={500}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Contenido principal del reproductor */}
        <div className="flex flex-col lg:flex-row items-center gap-6">
          
          {/* Información de la pista */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                {radioState.currentTrack && 'artwork_url' in radioState.currentTrack && radioState.currentTrack.artwork_url ? (
                  <img 
                    src={radioState.currentTrack.artwork_url} 
                    alt={radioState.currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full radio-gradient flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              {/* Indicador de actividad */}
              {radioState.isPlaying && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              
              {/* Indicador de carga */}
              {radioState.isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="loading-spinner" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="font-semibold text-foreground truncate text-lg">
                  {radioState.currentTrack?.title || 'Sin reproducción'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {radioState.currentTrack?.artist || 'Artista desconocido'}
                </p>
              </div>
              
              {/* Barra de progreso y tiempo */}
              {radioState.currentTrack && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTime(getCurrentTime())}</span>
                    <span>{formatTime(radioState.currentTrack.duration)}</span>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      {/* Barra de buffer */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-muted-foreground/30 transition-all duration-300"
                        style={{ width: `${radioState.bufferHealth}%` }}
                      />
                      {/* Barra de progreso */}
                      <div 
                        className="absolute top-0 left-0 h-full radio-gradient transition-all duration-300"
                        style={{ width: `${radioState.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Atribución para contenido externo */}
              {getAttribution() && (
                <p className="text-xs text-muted-foreground italic">
                  {getAttribution()}
                </p>
              )}
            </div>
          </div>

          {/* Controles de reproducción */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTrack}
              disabled={radioState.history.length === 0}
              className="hover:bg-accent"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={togglePlay}
              size="lg"
              disabled={radioState.isLoading || !radioState.currentTrack}
              className="w-14 h-14 rounded-full radio-gradient hover:opacity-90 transition-opacity shadow-lg"
            >
              {radioState.isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              className="hover:bg-accent"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Visualizador y controles de volumen */}
          <div className="flex items-center gap-4">
            <AdvancedAudioVisualizer
              isPlaying={radioState.isPlaying && !radioState.isLoading}
              volume={radioState.volume}
              variant="bars"
              barCount={8}
              height={50}
              className="w-24"
            />
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="hover:bg-accent"
              >
                {isMuted || radioState.volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <div className="w-20 hidden sm:block">
                <Slider
                  value={[radioState.volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* DJ Avatar */}
            <DJAvatar 
              isActive={false}
              onActivate={onDJActivate || (() => {})}
            />

            {/* Botones de acción */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-red-500">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdvancedAudioPlayer;
