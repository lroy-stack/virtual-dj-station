
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Zap, 
  Users, 
  TrendingUp, 
  Crown,
  Mic,
  Upload,
  BarChart3
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import AudioPlayer from '@/components/radio/AudioPlayer';
import NowPlaying from '@/components/radio/NowPlaying';
import RecentTracks from '@/components/radio/RecentTracks';
import AudioVisualizer from '@/components/radio/AudioVisualizer';
import { useRadio } from '@/hooks/useRadio';

const Index = () => {
  const { radioState } = useRadio();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalListeners: 1247,
    activeStreams: 1,
    tracksPlayed: 892,
    artistsActive: 156
  });

  // Simulate real-time listener count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalListeners: prev.totalListeners + Math.floor(Math.random() * 10 - 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Radio,
      title: 'Radio 24/7',
      description: 'Transmisión continua de música independiente curada por IA',
      color: 'from-primary to-primary/80'
    },
    {
      icon: Mic,
      title: 'Locutor IA',
      description: 'Presentaciones inteligentes y anuncios personalizados',
      color: 'from-secondary to-secondary/80'
    },
    {
      icon: Upload,
      title: 'Sube tu Música',
      description: 'Comparte tus creaciones con miles de oyentes',
      color: 'from-purple-500 to-purple/80'
    },
    {
      icon: BarChart3,
      title: 'Estadísticas',
      description: 'Analiza el rendimiento de tus canciones en tiempo real',
      color: 'from-green-500 to-green/80'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Navigation user={user} onLogout={() => setUser(null)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 radio-gradient rounded-2xl flex items-center justify-center animate-float">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              EN VIVO
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Radio IA</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            La primera plataforma de radio online impulsada por inteligencia artificial. 
            Transmisión 24/7 de música independiente con un locutor virtual que nunca duerme.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{stats.totalListeners.toLocaleString()} oyentes activos</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span>{stats.tracksPlayed} canciones reproducidas hoy</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span>{stats.artistsActive} artistas activos</span>
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <Card className="glass-effect p-4 mb-8 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">EN VIVO</span>
              </div>
              <AudioVisualizer isPlaying={radioState.isPlaying} barCount={8} />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{stats.totalListeners.toLocaleString()} oyentes</span>
              <span>•</span>
              <span>Stream #{stats.activeStreams}</span>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Now Playing - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <NowPlaying 
              track={radioState.currentTrack} 
              isPlaying={radioState.isPlaying}
              listeners={stats.totalListeners}
            />
          </div>

          {/* Quick Actions */}
          <Card className="glass-effect p-6">
            <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <Button className="w-full radio-gradient hover:opacity-90">
                <Crown className="w-4 h-4 mr-2" />
                Hazte Premium
              </Button>
              <Button variant="outline" className="w-full border-primary/50 hover:bg-primary/10">
                <Upload className="w-4 h-4 mr-2" />
                Sube tu Música
              </Button>
              <Button variant="ghost" className="w-full">
                <Mic className="w-4 h-4 mr-2" />
                Crear Anuncio
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Tracks */}
        <div className="mb-8">
          <RecentTracks tracks={[]} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="glass-effect p-6 hover-lift group cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="glass-effect p-8 text-center border border-primary/20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para ser escuchado?
            </h2>
            <p className="text-muted-foreground mb-6">
              Únete a cientos de artistas que ya comparten su música en Radio IA. 
              Obtén estadísticas detalladas, prioridad en la reproducción y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="radio-gradient hover:opacity-90">
                <Zap className="w-5 h-5 mr-2" />
                Empezar Gratis
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Ver Planes
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Audio Player - Fixed at bottom */}
      <AudioPlayer />
    </div>
  );
};

export default Index;
