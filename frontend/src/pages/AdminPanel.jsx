// frontend/src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import LoginPage from '../components/auth/LoginPage';
import Sidebar from '../components/admin/Sidebar';
import Dashboard from '../components/admin/Dashboard';
import GestionCategorias from '../components/admin/GestionCategorias';
import GestionProductos from '../components/admin/GestionProductos';
import PlaceholderView from '../components/common/PlaceholderView';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLoginSuccess = (data) => {
    console.log('✅ Login exitoso:', data);
    setUserData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          token={userData.token} 
          sucursalCodigo={userData.sucursalCodigo}
          userRole={userData.rol}
        />;
      case 'pedidos':
        return <PlaceholderView title="Gestión de Pedidos" />;
      case 'productos':
        return <GestionProductos token={userData.token} sucursalCodigo={userData.sucursalCodigo} />;
      case 'categorias':
        return <GestionCategorias token={userData.token} sucursalCodigo={userData.sucursalCodigo} />;
      case 'promociones':
        return <PlaceholderView title="Gestión de Promociones" />;
      case 'usuarios':
        return <PlaceholderView title="Gestión de Usuarios" />;
      case 'reportes':
        return <PlaceholderView title="Reportes y Análisis" />;
      default:
        return <Dashboard token={userData.token} sucursalCodigo={userData.sucursalCodigo} userRole={userData.rol} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={userData.rol}
        sucursalCodigo={userData.sucursalCodigo}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="font-bold text-lg">Super Milas Admin</h1>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;