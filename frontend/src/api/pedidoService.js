import api from './axiosConfig';

export async function getPedidos() {
  const { data } = await api.get('/pedidos');
  return data;
}
