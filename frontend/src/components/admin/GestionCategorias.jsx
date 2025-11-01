// frontend/src/components/admin/GestionCategorias.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, Power, AlertCircle } from 'lucide-react';
import { API_BASE } from '../../config/api';

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

export default GestionCategorias;