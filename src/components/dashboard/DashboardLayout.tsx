
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Music, 
  Upload, 
  BarChart3, 
  Settings, 
  CreditCard,
  Megaphone,
  Users,
  Menu,
  X,
  Crown,
  LogOut
} from 'lucide-react';
import { User } from '@/types';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentPlan, hasActiveSubscription } = useSubscription(user);

  const getUserRole = () => {
    if (user.subscription_tier?.includes('artist')) return 'artist';
    if (user.subscription_tier?.includes('advertiser')) return 'advertiser';
    return 'listener';
  };

  const role = getUserRole();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['listener', 'artist', 'advertiser'],
    },
    {
      name: 'Mi Música',
      href: '/dashboard/music',
      icon: Music,
      roles: ['artist'],
    },
    {
      name: 'Subir Música',
      href: '/dashboard/upload',
      icon: Upload,
      roles: ['artist'],
    },
    {
      name: 'Mis Anuncios',
      href: '/dashboard/ads',
      icon: Megaphone,
      roles: ['advertiser'],
    },
    {
      name: 'Crear Anuncio',
      href: '/dashboard/create-ad',
      icon: Upload,
      roles: ['advertiser'],
    },
    {
      name: 'Estadísticas',
      href: '/dashboard/stats',
      icon: BarChart3,
      roles: ['artist', 'advertiser'],
    },
    {
      name: 'Suscripción',
      href: '/dashboard/subscription',
      icon: CreditCard,
      roles: ['listener', 'artist', 'advertiser'],
    },
    {
      name: 'Configuración',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['listener', 'artist', 'advertiser'],
    },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(role)
  );

  const isActive = (href: string) => location.pathname === href;

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-md border-r border-border/50">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 radio-gradient rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gradient">Radio IA</h2>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
        </div>
        
        {hasActiveSubscription && currentPlan ? (
          <Badge className="bg-primary/20 text-primary border-primary/50">
            <Crown className="w-3 h-3 mr-1" />
            {currentPlan.name}
          </Badge>
        ) : (
          <Badge variant="outline">Plan Gratuito</Badge>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isCurrentPage = isActive(item.href);
          return (
            <Button
              key={item.name}
              variant={isCurrentPage ? "default" : "ghost"}
              className={`w-full justify-start space-x-3 ${
                isCurrentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
              onClick={() => {
                navigate(item.href);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-gradient flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-card/50 backdrop-blur-md border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-gradient">Radio IA</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
