import { useEffect, useState } from 'react';
import { getPedidos } from '../api/pedidoService';
import socket from '../socket';

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    loadPedidos();
    socket.on('pedido:nuevo', (pedido) => {
      setPedidos((prev) => [pedido, ...prev]);
    });
    return () => socket.off('pedido:nuevo');
  }, []);

  const loadPedidos = async () => {
    const data = await getPedidos();
    setPedidos(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Pedidos en tiempo real</h2>
      {pedidos.map((p) => (
        <div key={p._id} className="border p-3 mb-2 rounded shadow-sm">
          <p><strong>Cliente:</strong> {p.cliente}</p>
          <p><strong>Total:</strong> ${p.total}</p>
        </div>
      ))}
    </div>
  );
}
