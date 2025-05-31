
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import SubscriptionPage from '@/components/dashboard/SubscriptionPage';
import { User } from '@/types';

const DashboardPage: React.FC = () => {
  // TODO: Replace with actual auth state
  const [user] = useState<User | null>({
    id: '1',
    email: 'usuario@ejemplo.com',
    name: 'Usuario Demo',
    subscription_tier: 'artist_basic',
    subscription_status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  });

  const handleLogout = () => {
    console.log('Logout from dashboard');
    // TODO: Implement actual logout logic
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route index element={<DashboardHome user={user} />} />
        <Route path="subscription" element={<SubscriptionPage user={user} />} />
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
