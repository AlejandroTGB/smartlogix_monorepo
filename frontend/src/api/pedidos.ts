import client from "./client";
export interface PedidoItem {
  producto_id: number;
  cantidad: number;
}
export interface Pedido {
  id: number;
  cliente_id: number;
  productos: PedidoItem[];
  estado: string;
}
export interface PedidoCreate {
  cliente_id: number;
  productos: PedidoItem[];
}
export interface EstadoPedidoUpdate {
  estado: string;
}
export async function getPedidos(): Promise<Pedido[]> {
  const { data } = await client.get("/api/v1/pedidos");
  return data;
}
export async function getPedido(id: number): Promise<Pedido> {
  const { data } = await client.get(`/api/v1/pedidos/${id}`);
  return data;
}
export async function createPedido(pedido: PedidoCreate): Promise<Pedido> {
  const { data } = await client.post("/api/v1/pedidos", pedido);
  return data;
}
export async function updatePedidoEstado(
  id: number,
  estado: EstadoPedidoUpdate,
): Promise<Pedido> {
  const { data } = await client.put(`/api/v1/pedidos/${id}/estado`, estado);
  return data;
}
export async function deletePedido(id: number): Promise<void> {
  await client.delete(`/api/v1/pedidos/${id}`);
}
