import { useEffect, useState } from 'react';
import { getPedidos } from '../api/pedidoService';

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await getPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold mb-4">Pedidos en tiempo real</h2>
      <div className="grid gap-4">
        {pedidos.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded shadow">
            <p><strong>Cliente:</strong> {p.cliente}</p>
            <p><strong>Total:</strong> ${p.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}