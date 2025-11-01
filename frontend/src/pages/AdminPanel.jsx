import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, Package, ShoppingCart, TrendingUp, 
  LogOut, Menu, X, Tag, FileText, LayoutDashboard,
  DollarSign, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Edit2, Trash2, Search, Save, ArrowUp, ArrowDown, Power
} from 'lucide-react';

const API_BASE = 'http://localhost:4000';

// Componente de Login
const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Super Milas</h1>
          <p className="text-gray-600 mt-2">Panel de Administración</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@supermilas.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar
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

// Dashboard (sin cambios)
const Dashboard = ({ token, sucursalCodigo, userRole }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSucursal, setSelectedSucursal] = useState(sucursalCodigo || 'RES');
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadStats();
  }, [selectedSucursal, dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/reportes/resumen?sucursal=${selectedSucursal}&desde=${dateRange.desde}&hasta=${dateRange.hasta}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          } 
        }
      );
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {userRole === 'admin' && (
            <select
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="RES">Resistencia</option>
              <option value="COR1">Corrientes 1</option>
              <option value="COR2">Corrientes 2</option>
            </select>
          )}
          <input
            type="date"
            value={dateRange.desde}
            onChange={(e) => setDateRange({...dateRange, desde: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange.hasta}
            onChange={(e) => setDateRange({...dateRange, hasta: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={loadStats} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart size={32} className="opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Total</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">{stats?.totales?.totalPedidos || 0}</h3>
          <p className="text-blue-100">Pedidos</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Facturado</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">${stats?.totales?.totalFacturado?.toFixed(2) || '0.00'}</h3>
          <p className="text-green-100">Total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} className="opacity-80" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">Promedio</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">${stats?.totales?.ticketPromedio?.toFixed(2) || '0.00'}</h3>
          <p className="text-purple-100">Ticket Promedio</p>
        </div>
      </div>
    </div>
  );
};

// ========== GESTIÓN DE CATEGORÍAS (MODIFICADO) ==========
const GestionCategorias = ({ token, sucursalCodigo }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    orden: 0,
    activa: true
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, [sucursalCodigo]);

  const loadCategorias = async () => {
    setLoading(true);
    const sucursal = sucursalCodigo || 'RES';
    console.log('🔍 Cargando categorías para sucursal:', sucursal);
    
    try {
      const url = `${API_BASE}/api/admin/categorias?sucursal=${sucursal}`;
      console.log('📡 Fetching:', url);
      
      const res = await fetch(url, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await res.json();
      console.log('📦 Respuesta:', data);
      
      let categoriasArray = [];
      if (Array.isArray(data)) {
        categoriasArray = data;
      } else if (data.items) {
        categoriasArray = data.items;
      }
      
      console.log('✅ Categorías cargadas:', categoriasArray.length);
      setCategorias(categoriasArray);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (nombre) => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNombreChange = (nombre) => {
    setFormData({
      ...formData,
      nombre,
      slug: generateSlug(nombre)
    });
  };

  const openCreateModal = () => {
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      slug: '',
      orden: categorias.length,
      activa: true
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      slug: categoria.slug,
      orden: categoria.orden,
      activa: categoria.activa
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = editingCategoria
        ? `${API_BASE}/api/admin/categorias/${editingCategoria._id}`
        : `${API_BASE}/api/admin/categorias`;

      const method = editingCategoria ? 'PATCH' : 'POST';

      // ✅ CAMBIO PRINCIPAL: Asegurar que siempre se envíe sucursal
      const payload = {
        ...formData,
        sucursal: sucursalCodigo || 'RES'
      };

      console.log('💾 Guardando categoría:', method, payload);

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('📥 Respuesta:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar categoría');
      }

      setShowModal(false);
      loadCategorias();
    } catch (err) {
      console.error('❌ Error:', err);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/categorias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar');
      }

      loadCategorias();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActiva = async (id, activa) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/categorias/${id}/activar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activa: !activa })
      });

      if (!res.ok) throw new Error('Error al cambiar estado');
      loadCategorias();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredCategorias = categorias.filter(cat =>
    cat.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h2>
            <p className="text-gray-600 mt-1">
              Administra las categorías de productos
              {sucursalCodigo && <span className="font-semibold"> - Sucursal: {sucursalCodigo}</span>}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Nueva Categoría</span>
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Orden</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategorias.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <AlertCircle className="mx-auto mb-2 text-gray-400" size={48} />
                    <p className="text-gray-500 font-semibold">No hay categorías</p>
                    <p className="text-gray-400 text-sm mt-1">Crea tu primera categoría</p>
                  </td>
                </tr>
              ) : (
                filteredCategorias.map((cat) => (
                  <tr key={cat._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{cat.orden}</td>
                    <td className="py-3 px-4 font-medium">{cat.nombre}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{cat.slug}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActiva(cat._id, cat.activa)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          cat.activa
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <Power size={12} />
                        <span>{cat.activa ? 'Activa' : 'Inactiva'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.nombre)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredCategorias.length} de {categorias.length} categorías
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Bebidas, Snacks, Lácteos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="bebidas"
                />
                <p className="text-xs text-gray-500 mt-1">Solo minúsculas, números y guiones</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal *
                </label>
                <input
                  type="text"
                  value={sucursalCodigo || 'RES'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  La categoría se creará para esta sucursal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="activa" className="text-sm font-medium text-gray-700">
                  Categoría activa
                </label>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="mr-2 flex-shrink-0" size={20} />
                  <span className="text-sm">{formError}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{submitting ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PlaceholderView = ({ title }) => (
  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
      <Clock size={48} className="text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-600">Esta sección está en desarrollo</p>
  </div>
);

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
        return <PlaceholderView title="Gestión de Productos" />;
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