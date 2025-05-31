
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Music, 
  Users, 
  Play,
  Upload,
  Crown,
  BarChart3,
  Megaphone
} from 'lucide-react';
import { User } from '@/types';
import { useSubscription, useDashboardStats } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface DashboardHomeProps {
  user: User;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const { currentPlan, usage, hasActiveSubscription, canUploadSongs, canCreateAds } = useSubscription(user);
  const { data: stats } = useDashboardStats(user);

  const getUserRole = () => {
    if (user.subscription_tier?.includes('artist')) return 'artist';
    if (user.subscription_tier?.includes('advertiser')) return 'advertiser';
    return 'listener';
  };

  const role = getUserRole();

  // Quick stats based on role
  const getQuickStats = () => {
    const baseStats = [
      {
        name: 'Tiempo de Escucha',
        value: stats?.avg_listen_time ? `${Math.round(stats.avg_listen_time / 60)}h` : '0h',
        icon: Play,
        color: 'text-blue-500',
      },
    ];

    if (role === 'artist') {
      return [
        ...baseStats,
        {
          name: 'Canciones Subidas',
          value: `${usage?.songs_uploaded || 0}${currentPlan?.max_uploads ? `/${currentPlan.max_uploads}` : ''}`,
          icon: Music,
          color: 'text-green-500',
        },
        {
          name: 'Reproducciones Totales',
          value: stats?.total_plays?.toLocaleString() || '0',
          icon: TrendingUp,
          color: 'text-purple-500',
        },
        {
          name: 'Oyentes Únicos',
          value: stats?.unique_listeners?.toLocaleString() || '0',
          icon: Users,
          color: 'text-orange-500',
        },
      ];
    }

    if (role === 'advertiser') {
      return [
        ...baseStats,
        {
          name: 'Anuncios Activos',
          value: `${usage?.ads_created || 0}${currentPlan?.max_ads ? `/${currentPlan.max_ads}` : ''}`,
          icon: Megaphone,
          color: 'text-red-500',
        },
        {
          name: 'Reproducciones',
          value: stats?.total_plays?.toLocaleString() || '0',
          icon: TrendingUp,
          color: 'text-purple-500',
        },
        {
          name: 'Alcance',
          value: stats?.unique_listeners?.toLocaleString() || '0',
          icon: Users,
          color: 'text-orange-500',
        },
      ];
    }

    return baseStats;
  };

  const quickStats = getQuickStats();

  // Quick actions based on role
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Ver Estadísticas',
        description: 'Revisa tu actividad en la plataforma',
        icon: BarChart3,
        onClick: () => navigate('/dashboard/stats'),
        variant: 'outline' as const,
      },
    ];

    if (role === 'artist') {
      return [
        {
          title: 'Subir Música',
          description: 'Comparte tu música con el mundo',
          icon: Upload,
          onClick: () => navigate('/dashboard/upload'),
          variant: 'default' as const,
          disabled: !canUploadSongs(usage?.songs_uploaded || 0),
        },
        ...baseActions,
        {
          title: 'Gestionar Música',
          description: 'Edita y administra tus canciones',
          icon: Music,
          onClick: () => navigate('/dashboard/music'),
          variant: 'outline' as const,
        },
      ];
    }

    if (role === 'advertiser') {
      return [
        {
          title: 'Crear Anuncio',
          description: 'Crea un nuevo anuncio con IA',
          icon: Megaphone,
          onClick: () => navigate('/dashboard/create-ad'),
          variant: 'default' as const,
          disabled: !canCreateAds(usage?.ads_created || 0),
        },
        ...baseActions,
        {
          title: 'Gestionar Anuncios',
          description: 'Administra tus anuncios activos',
          icon: Megaphone,
          onClick: () => navigate('/dashboard/ads'),
          variant: 'outline' as const,
        },
      ];
    }

    return [
      {
        title: 'Actualizar Plan',
        description: 'Desbloquea funciones premium',
        icon: Crown,
        onClick: () => navigate('/plans'),
        variant: 'default' as const,
      },
      ...baseActions,
    ];
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, <span className="text-gradient">{user.name || 'Usuario'}!</span>
        </h1>
        <p className="text-muted-foreground">
          {role === 'artist' && 'Gestiona tu música y conecta con oyentes de todo el mundo.'}
          {role === 'advertiser' && 'Crea anuncios impactantes con nuestro locutor IA.'}
          {role === 'listener' && 'Descubre nueva música independiente las 24 horas.'}
        </p>
      </div>

      {/* Plan Status */}
      {!hasActiveSubscription && role !== 'listener' && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Actualiza tu plan</p>
                  <p className="text-sm text-muted-foreground">
                    Desbloquea todas las funciones premium
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/plans')}>
                Ver Planes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.name} className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Progress (for paid plans) */}
      {hasActiveSubscription && currentPlan && (role === 'artist' || role === 'advertiser') && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Uso del Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {role === 'artist' && currentPlan.max_uploads && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Canciones subidas</span>
                  <span>{usage?.songs_uploaded || 0} / {currentPlan.max_uploads}</span>
                </div>
                <Progress 
                  value={((usage?.songs_uploaded || 0) / currentPlan.max_uploads) * 100} 
                  className="h-2"
                />
              </div>
            )}
            {role === 'advertiser' && currentPlan.max_ads && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Anuncios creados</span>
                  <span>{usage?.ads_created || 0} / {currentPlan.max_ads}</span>
                </div>
                <Progress 
                  value={((usage?.ads_created || 0) / currentPlan.max_ads) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center space-x-2 self-start">
                <action.icon className="w-5 h-5" />
                <span className="font-medium">{action.title}</span>
              </div>
              <p className="text-sm text-left opacity-80">{action.description}</p>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats?.top_content && stats.top_content.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Contenido Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_content.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'song' ? 'Canción' : 'Anuncio'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.plays.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">reproducciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;
