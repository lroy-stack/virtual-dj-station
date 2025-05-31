
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Music, Mail, Lock, User, Mic, Megaphone } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    userType: 'listener',
    artistName: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const userTypes = [
    {
      id: 'listener',
      title: 'Oyente',
      description: 'Escucha música gratis con anuncios ocasionales',
      icon: User,
      features: ['Acceso gratuito', 'Música 24/7', 'Calidad estándar']
    },
    {
      id: 'artist',
      title: 'Artista',
      description: 'Sube tu música y gana exposición',
      icon: Mic,
      features: ['Sube canciones', 'Estadísticas', 'Mayor visibilidad']
    },
    {
      id: 'advertiser',
      title: 'Anunciante',
      description: 'Promociona tu negocio con anuncios personalizados',
      icon: Megaphone,
      features: ['Anuncios personalizados', 'Targeting específico', 'Voz IA']
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      // TODO: Show error toast
      console.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // TODO: Implement actual registration logic with Supabase
    console.log('Registration attempt:', formData);
    
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to plans or dashboard
      if (formData.userType !== 'listener') {
        navigate('/plans');
      } else {
        navigate('/');
      }
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      userType: value
    }));
  };

  const selectedType = userTypes.find(type => type.id === formData.userType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 radio-gradient rounded-xl flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">Radio IA</span>
          </Link>
        </div>

        {/* Registration Form */}
        <Card className="glass-effect border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Únete a la revolución de la radio inteligente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-foreground">
                ¿Cómo planeas usar Radio IA?
              </Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={handleUserTypeChange}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {userTypes.map((type) => (
                  <div key={type.id} className="relative">
                    <RadioGroupItem
                      value={type.id}
                      id={type.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.id}
                      className="flex flex-col p-4 border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:bg-primary/10 hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <type.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{type.title}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {type.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nombre Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Artist-specific fields */}
              {formData.userType === 'artist' && (
                <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <h3 className="font-semibold text-foreground">Información de Artista</h3>
                  <div className="space-y-2">
                    <Label htmlFor="artistName" className="text-foreground">
                      Nombre Artístico
                    </Label>
                    <Input
                      id="artistName"
                      name="artistName"
                      type="text"
                      placeholder="Tu nombre artístico"
                      value={formData.artistName}
                      onChange={handleChange}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground">
                      Biografía (Opcional)
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Cuéntanos sobre tu música..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="bg-background/50"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full radio-gradient hover:opacity-90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner" />
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  `Crear Cuenta ${selectedType ? `como ${selectedType.title}` : ''}`
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Al crear una cuenta, aceptas nuestros</p>
          <p>
            <Link to="/terms" className="text-primary hover:underline">
              Términos de Servicio
            </Link>
            {' y '}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
