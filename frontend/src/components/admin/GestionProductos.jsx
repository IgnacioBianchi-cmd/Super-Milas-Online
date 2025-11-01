// frontend/src/components/admin/GestionProductos.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Save, Power, AlertCircle, 
  Eye, EyeOff, DollarSign, Package, Tag, X, Grid, List
} from 'lucide-react';
import { API_BASE } from '../../config/api';

const GestionProductos = ({ token, sucursalCodigo }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [filterVisible, setFilterVisible] = useState('todos');
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    variantes: [{ nombre: '', precio: 0, activa: true }],
    orden: 0,
    visible: true,
    sucursales: ['RES', 'COR1', 'COR2'],
    etiquetas: []
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategorias();
    loadProductos();
  }, [sucursalCodigo]);

  const loadCategorias = async () => {
    const sucursal = sucursalCodigo || 'RES';
    try {
      const res = await fetch(`${API_BASE}/api/admin/categorias?sucursal=${sucursal}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setCategorias([]);
    }
  };

  const loadProductos = async () => {
    setLoading(true);
    const sucursal = sucursalCodigo || 'RES';
    
    try {
      let url = `${API_BASE}/api/admin/productos?sucursal=${sucursal}`;
      if (selectedCategoria) url += `&categoria=${selectedCategoria}`;
      if (filterVisible !== 'todos') url += `&visible=${filterVisible === 'visible'}`;
      
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await res.json();
      setProductos(data.items || []);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, [selectedCategoria, filterVisible]);

  const openCreateModal = () => {
    setEditingProducto(null);
    setFormData({
      titulo: '',
      descripcion: '',
      categoria: categorias[0]?._id || '',
      variantes: [{ nombre: 'Unidad', precio: 0, activa: true }],
      orden: productos.length,
      visible: true,
      sucursales: [sucursalCodigo || 'RES'],
      etiquetas: []
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (producto) => {
    setEditingProducto(producto);
    setFormData({
      titulo: producto.titulo,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria._id,
      variantes: producto.variantes.map(v => ({ ...v })),
      orden: producto.orden,
      visible: producto.visible,
      sucursales: producto.sucursales,
      etiquetas: producto.etiquetas || []
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      // Validar variantes
      if (formData.variantes.length === 0) {
        throw new Error('Debe haber al menos una variante');
      }

      for (const v of formData.variantes) {
        if (!v.nombre.trim()) throw new Error('Todas las variantes deben tener nombre');
        if (v.precio < 0) throw new Error('Los precios no pueden ser negativos');
      }

      const url = editingProducto
        ? `${API_BASE}/api/admin/productos/${editingProducto._id}`
        : `${API_BASE}/api/admin/productos`;

      const method = editingProducto ? 'PATCH' : 'POST';

      const payload = editingProducto 
        ? { 
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            categoria: formData.categoria,
            orden: formData.orden,
            visible: formData.visible,
            sucursales: formData.sucursales,
            etiquetas: formData.etiquetas
          }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar producto');
      }

      // Si es edición y hay cambios en variantes, actualizar variantes por separado
      if (editingProducto) {
        const resVariantes = await fetch(`${API_BASE}/api/admin/productos/${editingProducto._id}/variantes`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ variantes: formData.variantes })
        });

        if (!resVariantes.ok) {
          throw new Error('Error al actualizar variantes');
        }
      }

      setShowModal(false);
      loadProductos();
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (!confirm(`¿Eliminar el producto "${titulo}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/productos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }

      loadProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleVisible = async (id, visible) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/productos/${id}/visible`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visible: !visible })
      });

      if (!res.ok) throw new Error('Error al cambiar visibilidad');
      loadProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const addVariante = () => {
    setFormData({
      ...formData,
      variantes: [...formData.variantes, { nombre: '', precio: 0, activa: true }]
    });
  };

  const removeVariante = (index) => {
    if (formData.variantes.length <= 1) {
      alert('Debe haber al menos una variante');
      return;
    }
    setFormData({
      ...formData,
      variantes: formData.variantes.filter((_, i) => i !== index)
    });
  };

  const updateVariante = (index, field, value) => {
    const nuevasVariantes = [...formData.variantes];
    nuevasVariantes[index][field] = value;
    setFormData({ ...formData, variantes: nuevasVariantes });
  };

  const filteredProductos = productos.filter(prod =>
    prod.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
            <p className="text-gray-600 mt-1">
              Administra el catálogo de productos
              {sucursalCodigo && <span className="font-semibold"> - Sucursal: {sucursalCodigo}</span>}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.nombre}</option>
            ))}
          </select>

          <select
            value={filterVisible}
            onChange={(e) => setFilterVisible(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="visible">Visibles</option>
            <option value="oculto">Ocultos</option>
          </select>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 flex items-center justify-center py-2 ${
                viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 flex items-center justify-center py-2 ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>

        {/* Vista de Tabla */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Variantes</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <Package className="mx-auto mb-2 text-gray-400" size={48} />
                      <p className="text-gray-500 font-semibold">No hay productos</p>
                      <p className="text-gray-400 text-sm mt-1">Crea tu primer producto</p>
                    </td>
                  </tr>
                ) : (
                  filteredProductos.map((prod) => (
                    <tr key={prod._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{prod.titulo}</p>
                          {prod.descripcion && (
                            <p className="text-sm text-gray-500 mt-1">{prod.descripcion}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Tag size={12} className="mr-1" />
                          {prod.categoria?.nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {prod.variantes.map((v, i) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{v.nombre}</span>
                              <span className="text-gray-600"> - ${v.precio.toFixed(2)}</span>
                              {!v.activa && (
                                <span className="ml-2 text-xs text-red-600">(Inactiva)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleVisible(prod._id, prod.visible)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            prod.visible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{prod.visible ? 'Visible' : 'Oculto'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod._id, prod.titulo)}
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
        ) : (
          /* Vista de Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductos.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="mx-auto mb-2 text-gray-400" size={48} />
                <p className="text-gray-500 font-semibold">No hay productos</p>
              </div>
            ) : (
              filteredProductos.map((prod) => (
                <div key={prod._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{prod.titulo}</h3>
                      <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {prod.categoria?.nombre}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleVisible(prod._id, prod.visible)}
                      className={`p-2 rounded-full ${
                        prod.visible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {prod.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {prod.variantes.map((v, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{v.nombre}</span>
                        <span className="font-semibold text-gray-800">${v.precio.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit2 size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(prod._id, prod.titulo)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredProductos.length} de {productos.length} productos
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Coca Cola"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del producto (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                    ))}
                  </select>
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
              </div>

              {/* Variantes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Variantes * (mínimo 1)
                  </label>
                  <button
                    type="button"
                    onClick={addVariante}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    <Plus size={16} />
                    <span>Agregar</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.variantes.map((variante, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={variante.nombre}
                        onChange={(e) => updateVariante(index, 'nombre', e.target.value)}
                        placeholder="Nombre (ej: 500ml)"
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-gray-500" />
                        <input
                          type="number"
                          value={variante.precio}
                          onChange={(e) => updateVariante(index, 'precio', parseFloat(e.target.value) || 0)}
                          step="0.01"
                          min="0"
                          required
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variante.activa}
                          onChange={(e) => updateVariante(index, 'activa', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Activa</span>
                      </label>
                      {formData.variantes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariante(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sucursales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponible en Sucursales
                </label>
                <div className="flex flex-wrap gap-3">
                  {['RES', 'COR1', 'COR2'].map(suc => (
                    <label key={suc} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sucursales.includes(suc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, sucursales: [...formData.sucursales, suc] });
                          } else {
                            setFormData({ ...formData, sucursales: formData.sucursales.filter(s => s !== suc) });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {suc === 'RES' ? 'Resistencia' : suc === 'COR1' ? 'Corrientes 1' : 'Corrientes 2'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibilidad */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="visible" className="text-sm font-medium text-gray-700">
                  Producto visible en el menú
                </label>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="mr-2 flex-shrink-0" size={20} />
                  <span className="text-sm">{formError}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
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
                  <span>{submitting ? 'Guardando...' : 'Guardar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProductos;