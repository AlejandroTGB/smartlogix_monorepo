import client from "./client";
import type { AuthResponse, RegisterResponse } from "../types/auth";
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await client.post("/api/v1/auth/login", { email, password });
  return data;
}
export async function register(
  email: string,
  password: string,
  nombre: string,
): Promise<RegisterResponse> {
  const { data } = await client.post("/api/v1/auth/registro", {
    email,
    password,
    nombre,
  });
  return data;
}
