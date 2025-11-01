// frontend/src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { API_BASE } from '../../config/api';

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

export default Dashboard;