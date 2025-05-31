
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Crown, 
  Star, 
  Zap, 
  Music, 
  Mic,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import AudioPlayer from '@/components/radio/AudioPlayer';

const PlansPage = () => {
  const plans = [
    {
      id: 'free',
      name: 'Oyente Gratuito',
      price: 0,
      period: 'gratis',
      description: 'Disfruta de la radio sin límites',
      icon: Music,
      color: 'from-gray-500 to-gray-600',
      popular: false,
      features: [
        'Acceso completo a la radio 24/7',
        'Calidad de audio estándar',
        'Historial de canciones',
        'Interacción básica con DJ IA',
        'Sin anuncios de terceros'
      ],
      limitations: [
        'No puedes subir música',
        'No puedes crear anuncios',
        'Sin estadísticas detalladas',
        'Sin prioridad en reproducción'
      ]
    },
    {
      id: 'artist_basic',
      name: 'Artista Básico',
      price: 9.99,
      period: 'mes',
      description: 'Para artistas emergentes',
      icon: Star,
      color: 'from-primary to-primary/80',
      popular: true,
      features: [
        'Todo lo del plan gratuito',
        'Sube hasta 5 canciones por mes',
        'Prioridad nivel 1 en reproducción',
        'Estadísticas básicas de reproducción',
        'Calidad de audio HD',
        'Soporte por email'
      ],
      limitations: [
        'Límite de 5 canciones/mes',
        'Sin anuncios personalizados',
        'Estadísticas limitadas'
      ]
    },
    {
      id: 'artist_premium',
      name: 'Artista Premium',
      price: 24.99,
      period: 'mes',
      description: 'Para artistas profesionales',
      icon: Crown,
      color: 'from-secondary to-secondary/80',
      popular: false,
      features: [
        'Todo lo del plan Artista Básico',
        'Canciones ilimitadas',
        'Prioridad nivel 2-3 en reproducción',
        'Estadísticas avanzadas y analytics',
        'Promoción destacada',
        'Soporte prioritario',
        'API para desarrolladores'
      ],
      limitations: [
        'Sin anuncios personalizados'
      ]
    },
    {
      id: 'advertiser',
      name: 'Anunciante Pro',
      price: 49.99,
      period: 'mes',
      description: 'Para crear anuncios con IA',
      icon: Mic,
      color: 'from-yellow-500 to-orange-500',
      popular: false,
      features: [
        'Todo lo del plan gratuito',
        'Creación de anuncios con DJ IA',
        'Hasta 10 anuncios activos',
        'Prioridad alta en anuncios',
        'Estadísticas de audiencia',
        'Segmentación por horarios',
        'Voces premium de ElevenLabs'
      ],
      limitations: [
        'No incluye subida de música',
        'Límite de 10 anuncios activos'
      ]
    }
  ];

  const features = [
    {
      icon: Music,
      title: 'Calidad de Audio',
      free: 'Estándar (128kbps)',
      artist: 'HD (320kbps)',
      advertiser: 'Estándar (128kbps)'
    },
    {
      icon: TrendingUp,
      title: 'Estadísticas',
      free: 'Básicas',
      artist: 'Avanzadas',
      advertiser: 'Audiencia'
    },
    {
      icon: Users,
      title: 'Soporte',
      free: 'Comunidad',
      artist: 'Email + Prioritario',
      advertiser: 'Dedicado'
    },
    {
      icon: Clock,
      title: 'Prioridad',
      free: 'Sin prioridad',
      artist: 'Nivel 1-3',
      advertiser: 'Alta'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Planes y Precios</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Elige el plan perfecto para tu viaje musical. Desde oyente casual hasta artista profesional.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative glass-effect p-6 hover-lift ${
                plan.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Más Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm text-foreground">Incluye:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold text-sm text-muted-foreground">Limitaciones:</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'radio-gradient hover:opacity-90' 
                    : plan.price === 0
                    ? 'bg-muted hover:bg-muted/80'
                    : 'border-primary/50 hover:bg-primary/10'
                }`}
                variant={plan.popular ? 'default' : plan.price === 0 ? 'secondary' : 'outline'}
              >
                {plan.price === 0 ? 'Empezar Gratis' : 'Suscribirse'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="glass-effect p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Comparación de Características</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4">Característica</th>
                  <th className="text-center py-3 px-4">Gratuito</th>
                  <th className="text-center py-3 px-4">Artista</th>
                  <th className="text-center py-3 px-4">Anunciante</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-border/20">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-primary" />
                        <span className="font-medium">{feature.title}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 text-muted-foreground">
                      {feature.free}
                    </td>
                    <td className="text-center py-4 px-4 text-muted-foreground">
                      {feature.artist}
                    </td>
                    <td className="text-center py-4 px-4 text-muted-foreground">
                      {feature.advertiser}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="glass-effect p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-muted-foreground text-sm">
                Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo ciclo de facturación.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Qué formatos de audio se aceptan?</h3>
              <p className="text-muted-foreground text-sm">
                Aceptamos MP3, WAV, FLAC y M4A. Recomendamos calidad mínima de 320kbps para mejor experiencia.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Cómo funciona la prioridad de reproducción?</h3>
              <p className="text-muted-foreground text-sm">
                Las canciones con mayor prioridad se reproducen con más frecuencia. Los suscriptores premium obtienen niveles de prioridad más altos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">¿Hay período de prueba gratuita?</h3>
              <p className="text-muted-foreground text-sm">
                Ofrecemos 7 días de prueba gratuita para todos los planes de pago. No se requiere tarjeta de crédito.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <AudioPlayer />
    </div>
  );
};

export default PlansPage;
