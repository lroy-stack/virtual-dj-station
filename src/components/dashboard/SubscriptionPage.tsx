
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { User } from '@/types';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SubscriptionPageProps {
  user: User;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { 
    subscription, 
    currentPlan, 
    plans, 
    hasActiveSubscription,
    createCheckout,
    cancelSubscription,
    isCreatingCheckout,
    isCancellingSubscription 
  } = useSubscription(user);

  const handleUpgrade = (planId: string) => {
    createCheckout({
      planId,
      successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
      cancelUrl: `${window.location.origin}/dashboard/subscription`,
    });
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    setShowCancelConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'canceled':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'trialing':
        return 'En Prueba';
      case 'past_due':
        return 'Pago Vencido';
      case 'canceled':
        return 'Cancelada';
      default:
        return 'Inactiva';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Mi Suscripción</span>
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu plan y facturación
        </p>
      </div>

      {/* Current Subscription */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Plan Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasActiveSubscription && subscription && currentPlan ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">
                    ${currentPlan.price}/{currentPlan.interval === 'month' ? 'mes' : 'año'}
                  </p>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  {getStatusText(subscription.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Próxima facturación</p>
                  <p className="font-medium flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(subscription.current_period_end), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Estado de renovación</p>
                  <p className="font-medium flex items-center space-x-2">
                    {subscription.cancel_at_period_end ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Se cancelará al final del período</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Renovación automática</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/plans')}
                  className="flex items-center space-x-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Cambiar Plan</span>
                </Button>
                
                {!subscription.cancel_at_period_end && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                  >
                    Cancelar Suscripción
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Plan Gratuito</h3>
              <p className="text-muted-foreground mb-6">
                Disfruta de la radio con funciones básicas
              </p>
              <Button
                onClick={() => navigate('/plans')}
                className="radio-gradient"
              >
                Actualizar a Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      {currentPlan && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Funciones de tu Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Planes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan?.id === plan.id;
              const canUpgrade = !isCurrentPlan && (!currentPlan || plan.price > currentPlan.price);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${isCurrentPlan ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                      Plan Actual
                    </Badge>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">
                          /{plan.interval === 'month' ? 'mes' : 'año'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {canUpgrade && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCreatingCheckout}
                      >
                        {isCreatingCheckout ? 'Procesando...' : 'Actualizar'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <span>Cancelar Suscripción</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ¿Estás seguro de que quieres cancelar tu suscripción? 
                Mantendrás el acceso hasta el final de tu período de facturación actual.
              </p>
              
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1"
                >
                  Mantener Plan
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isCancellingSubscription}
                  className="flex-1"
                >
                  {isCancellingSubscription ? 'Cancelando...' : 'Cancelar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
