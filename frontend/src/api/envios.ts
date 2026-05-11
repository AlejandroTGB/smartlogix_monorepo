import client from "./client";
export interface Envio {
  id: number;
  pedido_id: number;
  direccion_entrega: string;
  comuna: string;
  ciudad: string;
  transportista: string | null;
  codigo_seguimiento: string;
  estado: string;
}
export async function getEnvios(): Promise<Envio[]> {
  const { data } = await client.get("/api/v1/envios");
  return data;
}
