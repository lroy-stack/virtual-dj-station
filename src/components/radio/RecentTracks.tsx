
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Play } from 'lucide-react';
import { Track } from '@/types';

interface RecentTracksProps {
  tracks: Track[];
  onTrackSelect?: (track: Track) => void;
}

const MOCK_RECENT_TRACKS: Track[] = [
  {
    id: '3',
    title: 'Cosmic Journey',
    artist: 'Space Explorers',
    artist_id: 'artist3',
    duration: 210,
    file_url: '/audio/sample3.mp3',
    genre: 'Ambient',
    plays_count: 567,
    priority_level: 1,
    upload_date: '2024-01-13',
    status: 'approved'
  },
  {
    id: '4',
    title: 'Urban Rhythm',
    artist: 'City Beats',
    artist_id: 'artist4',
    duration: 195,
    file_url: '/audio/sample4.mp3',
    genre: 'Hip-Hop',
    plays_count: 1100,
    priority_level: 2,
    upload_date: '2024-01-12',
    status: 'approved'
  },
  {
    id: '5',
    title: 'Acoustic Dreams',
    artist: 'Folk Stories',
    artist_id: 'artist5',
    duration: 180,
    file_url: '/audio/sample5.mp3',
    genre: 'Folk',
    plays_count: 445,
    priority_level: 1,
    upload_date: '2024-01-11',
    status: 'approved'
  }
];

const RecentTracks: React.FC<RecentTracksProps> = ({ 
  tracks = MOCK_RECENT_TRACKS, 
  onTrackSelect 
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className="glass-effect p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Reproducidas Recientemente</h2>
        <Badge variant="outline" className="text-xs">
          {tracks.length} canciones
        </Badge>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="group p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
            onClick={() => onTrackSelect?.(track)}
          >
            <div className="flex items-center gap-3">
              {/* Play Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-4 h-4" />
              </Button>

              {/* Track Number */}
              <div className="w-6 text-center text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                {index + 1}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {track.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist}
                </p>
              </div>

              {/* Genre Badge */}
              {track.genre && (
                <Badge variant="secondary" className="text-xs hidden sm:flex">
                  {track.genre}
                </Badge>
              )}

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatPlayCount(track.plays_count)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(track.duration)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
          Ver historial completo
        </Button>
      </div>
    </Card>
  );
};

export default RecentTracks;
