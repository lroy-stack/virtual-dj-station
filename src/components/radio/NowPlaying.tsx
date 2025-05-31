
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  TrendingUp,
  Heart,
  Share,
  ExternalLink 
} from 'lucide-react';
import { Track } from '@/types';
import { ExternalTrack } from '@/services/MusicSourceManager';
import AudioVisualizer from './AudioVisualizer';

interface NowPlayingProps {
  track?: Track | ExternalTrack;
  isPlaying: boolean;
  listeners?: number;
}

const NowPlaying: React.FC<NowPlayingProps> = ({ 
  track, 
  isPlaying, 
  listeners = 1247 
}) => {
  if (!track) {
    return (
      <Card className="glass-effect p-6">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            🎵
          </div>
          <p>No hay reproducción activa</p>
        </div>
      </Card>
    );
  }

  // Type-safe property access
  const isUserTrack = 'file_url' in track;
  const artworkUrl = isUserTrack ? track.artwork_url : (track as ExternalTrack).artwork_url;
  const playsCount = isUserTrack ? (track as Track).plays_count : 0;
  const priorityLevel = isUserTrack ? (track as Track).priority_level : 1;
  const genre = track.genre;

  return (
    <Card className="glass-effect p-6 hover-lift">
      <div className="flex items-start gap-4">
        {/* Artwork */}
        <div className="relative">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-secondary">
            {artworkUrl ? (
              <img 
                src={artworkUrl} 
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full radio-gradient flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            )}
          </div>
          
          {isPlaying && (
            <div className="absolute -bottom-2 -right-2">
              <AudioVisualizer isPlaying={isPlaying} barCount={3} />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-foreground truncate">
                {track.title}
              </h3>
              <p className="text-muted-foreground truncate">
                por {track.artist}
              </p>
              
              {genre && (
                <Badge variant="secondary" className="mt-2">
                  {genre}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" className="hover:text-red-500">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
            </div>
            
            {isUserTrack && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{playsCount.toLocaleString()} reproducciones</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{listeners.toLocaleString()} oyentes</span>
            </div>
          </div>

          {/* Priority Level */}
          {isUserTrack && priorityLevel > 1 && (
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className="text-xs border-primary/50 text-primary"
              >
                Prioridad {priorityLevel}
              </Badge>
            </div>
          )}

          {/* Source Attribution for External Tracks */}
          {!isUserTrack && 'attribution' in track && track.attribution && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground italic">
                {track.attribution}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NowPlaying;
