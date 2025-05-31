
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Clock, 
  Users, 
  Globe, 
  SkipForward,
  MoreVertical,
  Music
} from 'lucide-react';
import { QueueItem } from '@/services/MusicSourceManager';

interface PlaybackQueueProps {
  queue: QueueItem[];
  currentIndex?: number;
  onSkipTo: (index: number) => void;
  canReorder?: boolean;
  className?: string;
}

const PlaybackQueue: React.FC<PlaybackQueueProps> = ({
  queue,
  currentIndex = 0,
  onSkipTo,
  canReorder = false,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayQueue = showAll ? queue : queue.slice(0, 8);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceIcon = (source: 'user' | 'external') => {
    return source === 'user' ? <Users className="w-3 h-3" /> : <Globe className="w-3 h-3" />;
  };

  const getSourceLabel = (source: 'user' | 'external') => {
    return source === 'user' ? 'Usuario' : 'Externa';
  };

  const getTrackTitle = (track: any) => {
    return track.title || 'Sin título';
  };

  const getTrackArtist = (track: any) => {
    return track.artist || 'Artista desconocido';
  };

  const getTotalDuration = () => {
    return queue.reduce((total, item) => total + item.track.duration, 0);
  };

  return (
    <Card className={`glass-effect border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>Cola de Reproducción</span>
            <Badge variant="outline" className="text-xs">
              {queue.length} pistas
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(getTotalDuration())}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {displayQueue.map((item, index) => (
              <div
                key={`${item.track.id}_${index}`}
                className={`group p-3 rounded-lg border transition-all duration-200 hover:bg-accent/50 cursor-pointer ${
                  index === currentIndex 
                    ? 'bg-primary/10 border-primary/50 shadow-sm' 
                    : 'bg-card/30 border-border/30'
                }`}
                onClick={() => canReorder && onSkipTo(index)}
              >
                <div className="flex items-center space-x-3">
                  {/* Número de posición */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index === currentIndex ? (
                      <Play className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Información de la pista */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${
                          index === currentIndex ? 'text-primary' : 'text-foreground'
                        }`}>
                          {getTrackTitle(item.track)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getTrackArtist(item.track)}
                        </p>
                        
                        {/* Información adicional */}
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {getSourceIcon(item.source)}
                            <span className="ml-1">{getSourceLabel(item.source)}</span>
                          </Badge>
                          
                          {item.preloaded && (
                            <Badge variant="outline" className="text-xs px-1 py-0 text-green-500 border-green-500">
                              Cargado
                            </Badge>
                          )}
                          
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(item.track.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canReorder && index !== currentIndex && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSkipTo(index);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <SkipForward className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barra de prioridad */}
                <div className="mt-2 w-full bg-muted rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${Math.min(100, (item.priority / 100) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Mostrar más/menos */}
        {queue.length > 8 && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-xs"
            >
              {showAll ? 'Mostrar menos' : `Mostrar ${queue.length - 8} más`}
            </Button>
          </div>
        )}

        {/* Estadísticas de la cola */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{queue.filter(item => item.source === 'user').length} de usuarios</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>{queue.filter(item => item.source === 'external').length} externas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaybackQueue;
