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
export async function getPedidos(): Promise<Pedido[]> {
  const { data } = await client.get("/api/v1/pedidos");
  return data;
}
