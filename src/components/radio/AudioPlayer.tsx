
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  Heart,
  Share
} from 'lucide-react';
import { useRadio } from '@/hooks/useRadio';
import AudioVisualizer from './AudioVisualizer';
import DJAvatar from './DJAvatar';

const AudioPlayer: React.FC = () => {
  const { radioState, togglePlay, setVolume, nextTrack, previousTrack, simulateDJTalk } = useRadio();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);

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

  const currentTime = radioState.currentTrack 
    ? (radioState.progress / 100) * radioState.currentTrack.duration 
    : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-md border border-border/50 p-6 sticky bottom-0 z-40">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center overflow-hidden">
              {radioState.currentTrack?.artwork_url ? (
                <img 
                  src={radioState.currentTrack.artwork_url} 
                  alt={radioState.currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full radio-gradient flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            {radioState.isPlaying && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {radioState.currentTrack?.title || 'Sin reproducción'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {radioState.currentTrack?.artist || 'Artista desconocido'}
            </p>
            {radioState.currentTrack && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(radioState.currentTrack.duration)}
                </span>
                <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full radio-gradient transition-all duration-300"
                    style={{ width: `${radioState.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousTrack}
            className="hover:bg-accent"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            onClick={togglePlay}
            size="lg"
            className="w-12 h-12 rounded-full radio-gradient hover:opacity-90 transition-opacity"
          >
            {radioState.isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
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

        {/* Volume & Visualizer */}
        <div className="flex items-center gap-4">
          <AudioVisualizer isPlaying={radioState.isPlaying} />
          
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
            isActive={radioState.djActive} 
            onActivate={simulateDJTalk}
          />

          {/* Action Buttons */}
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
    </Card>
  );
};

export default AudioPlayer;
