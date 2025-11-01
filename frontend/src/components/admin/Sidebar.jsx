// frontend/src/components/admin/Sidebar.jsx
import React from 'react';
import { 
  Users, Package, ShoppingCart, TrendingUp,
  LogOut, X, Tag, FileText, LayoutDashboard
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, userRole, sucursalCodigo, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart, roles: ['admin', 'staff'] },
    { id: 'productos', label: 'Productos', icon: Package, roles: ['admin', 'staff'] },
    { id: 'categorias', label: 'Categorías', icon: Tag, roles: ['admin', 'staff'] },
    { id: 'promociones', label: 'Promociones', icon: TrendingUp, roles: ['admin', 'staff'] },
    { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'reportes', label: 'Reportes', icon: FileText, roles: ['admin', 'staff'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  const getSucursalNombre = (codigo) => {
    const nombres = {
      'RES': 'Resistencia',
      'COR1': 'Corrientes 1',
      'COR2': 'Corrientes 2'
    };
    return nombres[codigo] || codigo;
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Super Milas</h2>
                <p className="text-xs text-gray-400">{userRole === 'admin' ? 'Administrador' : 'Staff'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <X size={24} />
            </button>
          </div>
          <div className="mt-3 px-3 py-2 bg-gray-700 bg-opacity-50 rounded-lg">
            <p className="text-xs text-gray-400">Sucursal</p>
            <p className="text-sm font-semibold">{getSucursalNombre(sucursalCodigo)}</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {filteredItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${currentView === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                    : 'hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;