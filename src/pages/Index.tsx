
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/Navigation";
import AdvancedAudioPlayer from "@/components/radio/AdvancedAudioPlayer";
import NowPlaying from "@/components/radio/NowPlaying";
import PlaybackQueue from "@/components/radio/PlaybackQueue";
import AIHost from "@/components/ai-host/AIHost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Radio, Zap, Crown, Music } from "lucide-react";
import { useAdvancedRadio } from "@/hooks/useAdvancedRadio";
import { useState } from "react";

const Index = () => {
  const [isHostMinimized, setIsHostMinimized] = useState(false);
  const [user] = useState(null); // TODO: Replace with actual auth state

  // Mock user tracks
  const userTracks = [
    {
      id: '1',
      title: 'Mi Canción Original',
      artist: 'Usuario Artista',
      artist_id: 'user1',
      duration: 210,
      file_url: '/audio/user_track1.mp3',
      artwork_url: '/images/user_album1.jpg',
      genre: 'Indie',
      plays_count: 150,
      priority_level: 3,
      upload_date: '2024-01-20',
      status: 'approved' as const
    }
  ];

  const { 
    radioState, 
    togglePlay, 
    skipToQueueItem 
  } = useAdvancedRadio(userTracks, user?.subscription_tier || 'free');

  const handleLogout = () => {
    console.log('Logout');
  };

  const stats = {
    listeners: 1247,
    songsToday: 89,
    artistsActive: 34
  };

  const recentTracks = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Luna Rodriguez',
      artist_id: 'artist1',
      duration: 240,
      file_url: '/audio/sample1.mp3',
      genre: 'Indie Pop',
      plays_count: 892,
      priority_level: 2,
      upload_date: '2024-01-15',
      status: 'approved' as const
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'Neon Collective',
      artist_id: 'artist2',
      duration: 185,
      file_url: '/audio/sample2.mp3',
      genre: 'Electronic',
      plays_count: 1340,
      priority_level: 1,
      upload_date: '2024-01-14',
      status: 'approved' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <Navigation user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <Badge variant="outline" className="text-primary border-primary/50">
              🎙️ Locutor IA en vivo
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient">Radio IA</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              La primera radio inteligente del mundo. Música independiente 24/7 
              presentada por nuestro locutor con inteligencia artificial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={togglePlay}
              size="lg"
              className="radio-gradient hover:opacity-90 text-white px-8 py-4 text-lg"
              disabled={radioState.isLoading}
            >
              <Play className="w-6 h-6 mr-2" />
              {radioState.isPlaying ? 'Pausar' : 'Escuchar Ahora'}
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4">
              <Crown className="w-5 h-5 mr-2" />
              Ver Planes
            </Button>
          </div>

          {/* Live Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{stats.listeners.toLocaleString()} oyentes</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="w-4 h-4" />
              <span>{stats.songsToday} canciones hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <Radio className="w-4 h-4" />
              <span>{stats.artistsActive} artistas activos</span>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Now Playing & Queue */}
          <div className="lg:col-span-4 space-y-6">
            <NowPlaying
              track={radioState.currentTrack}
              isPlaying={radioState.isPlaying}
              listeners={stats.listeners}
            />
            
            <PlaybackQueue
              queue={radioState.queue}
              currentIndex={0}
              onSkipTo={skipToQueueItem}
              canReorder={user?.subscription_tier !== 'free'}
            />
          </div>

          {/* Center Column - AI Host */}
          <div className="lg:col-span-8">
            <AIHost
              currentTrack={radioState.currentTrack}
              isMinimized={isHostMinimized}
              onToggleMinimize={() => setIsHostMinimized(!isHostMinimized)}
            />
          </div>
        </div>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect p-6 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 radio-gradient rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Locutor IA</h3>
                <p className="text-sm text-muted-foreground">Inteligencia artificial</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Nuestro locutor con IA presenta cada canción con información relevante 
              y interactúa con los oyentes en tiempo real.
            </p>
          </Card>

          <Card className="glass-effect p-6 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Música Independiente</h3>
                <p className="text-sm text-muted-foreground">Artistas emergentes</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Descubre nueva música de artistas independientes de todo el mundo. 
              Cada canción es cuidadosamente seleccionada.
            </p>
          </Card>

          <Card className="glass-effect p-6 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">24/7 En Vivo</h3>
                <p className="text-sm text-muted-foreground">Siempre transmitiendo</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Radio en vivo las 24 horas del día, 7 días a la semana. 
              Nunca te quedes sin música nueva que descubrir.
            </p>
          </Card>
        </section>
      </main>

      {/* Advanced Audio Player - Always visible */}
      <AdvancedAudioPlayer 
        userTracks={userTracks}
        userTier={user?.subscription_tier || 'free'}
      />
    </div>
  );
};

export default Index;
