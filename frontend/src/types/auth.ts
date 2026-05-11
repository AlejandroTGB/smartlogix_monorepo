export interface User {
  id: number;
  nombre: string;
  rol: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
}
export interface AuthResponse {
  id: number;
  nombre: string;
  rol: string;
  token: string;
}
export interface RegisterResponse {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}
