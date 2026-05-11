import client from "./client";
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
}
export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
}
export async function getProductos(): Promise<Producto[]> {
  const { data } = await client.get("/api/v1/inventario/productos");
  return data;
}
export async function getProducto(id: number): Promise<Producto> {
  const { data } = await client.get(`/api/v1/inventario/productos/${id}`);
  return data;
}
export async function createProducto(
  producto: ProductoCreate,
): Promise<Producto> {
  const { data } = await client.post("/api/v1/inventario/productos", producto);
  return data;
}
