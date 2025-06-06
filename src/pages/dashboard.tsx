
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import SubscriptionPage from '@/components/dashboard/SubscriptionPage';

const DashboardPage: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Crear un objeto User compatible basado en el perfil de usuario real
  const dashboardUser = {
    id: user.id,
    email: user.email || '',
    name: userProfile?.username || user.email || 'Usuario',
    subscription_tier: userProfile?.subscription_type || 'free',
    subscription_status: 'active',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString()
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <DashboardLayout user={dashboardUser} onLogout={handleLogout}>
      <Routes>
        <Route index element={<DashboardHome user={dashboardUser} />} />
        <Route path="subscription" element={<SubscriptionPage user={dashboardUser} />} />
        {/* TODO: Add more dashboard routes */}
        <Route path="music" element={<div>Gestión de Música (Por implementar)</div>} />
        <Route path="upload" element={<div>Subir Música (Por implementar)</div>} />
        <Route path="ads" element={<div>Gestión de Anuncios (Por implementar)</div>} />
        <Route path="create-ad" element={<div>Crear Anuncio (Por implementar)</div>} />
        <Route path="stats" element={<div>Estadísticas (Por implementar)</div>} />
        <Route path="settings" element={<div>Configuración (Por implementar)</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;
