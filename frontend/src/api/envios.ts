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
export interface EnvioCreate {
  pedido_id: number;
  direccion_entrega: string;
  comuna: string;
  ciudad: string;
  transportista?: string | null;
}
export interface EstadoEnvioUpdate {
  estado: string;
}
export async function getEnvios(): Promise<Envio[]> {
  const { data } = await client.get("/api/v1/envios");
  return data;
}
export async function getEnvio(id: number): Promise<Envio> {
  const { data } = await client.get(`/api/v1/envios/${id}`);
  return data;
}
export async function createEnvio(envio: EnvioCreate): Promise<Envio> {
  const { data } = await client.post("/api/v1/envios", envio);
  return data;
}
export async function updateEnvioEstado(
  id: number,
  estado: EstadoEnvioUpdate,
): Promise<Envio> {
  const { data } = await client.put(`/api/v1/envios/${id}/estado`, estado);
  return data;
}
export async function deleteEnvio(id: number): Promise<void> {
  await client.delete(`/api/v1/envios/${id}`);
}
