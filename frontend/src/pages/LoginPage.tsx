import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
type LoginForm = z.infer<typeof loginSchema>;
export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const {
    register: fieldRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      const authData = await loginApi(data.email, data.password);
      login(
        { id: authData.id, nombre: authData.nombre, rol: authData.rol },
        authData.token,
      );
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.detail || "Credenciales incorrectas");
    }
  };
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col antialiased">
      <main className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-7xl flex flex-col md:flex-row bg-surface-container-lowest rounded-2xl overflow-hidden min-h-[870px] shadow-2xl ring-1 ring-black/5">
          {/* Left Panel */}
          <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 text-white bg-gradient-to-br from-primary-container to-primary">
            <div className="z-10">
              <div className="flex items-center gap-2 mb-12">
                <span
                  className="material-symbols-outlined text-secondary-fixed text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rocket_launch
                </span>
                <span className="font-headline font-extrabold text-2xl tracking-tight">
                  Smart Logix
                </span>
              </div>
              <div className="space-y-6 max-w-md">
                <h1 className="font-headline font-extrabold text-5xl lg:text-6xl leading-tight">
                  Bienvenido de vuelta
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Gestiona tus envíos, controla tu inventario y optimiza cada
                  movimiento logístico desde un solo lugar.
                </p>
              </div>
            </div>
            <div className="z-10 mt-auto">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Cheto</p>
                    <p className="text-xs text-white/60">
                      Director de INACAP
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm italic text-white/90">
                  "Si no enviamos los paquetes, los paquetes no llegan."
                </p>
              </div>
            </div>
          </div>
          {/* Right Panel - Form */}
          <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col p-8 lg:p-16 bg-surface-container-lowest">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center gap-2 mb-12">
              <span
                className="material-symbols-outlined text-secondary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                rocket_launch
              </span>
              <span className="font-headline font-bold text-xl tracking-tight text-primary">
                Smart Logix
              </span>
            </div>
            <div className="mb-10">
              <h2 className="font-headline font-bold text-3xl text-primary mb-2">
                Inicia sesión
              </h2>
              <p className="text-on-surface-variant font-medium">
                Accede a tu plataforma de gestión logística.
              </p>
            </div>
            {serverError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-bold">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3 text-outline text-lg">
                    mail
                  </span>
                  <input
                    {...fieldRegister("email")}
                    type="email"
                    className={`w-full pl-12 pr-4 py-3 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all placeholder:text-outline/50 outline-none ${errors.email ? "ring-2 ring-error" : ""}`}
                    placeholder="nombre@empresa.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs font-bold">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* Password */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3 text-outline text-lg">
                    lock
                  </span>
                  <input
                    {...fieldRegister("password")}
                    type="password"
                    className={`w-full pl-12 pr-4 py-3 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all placeholder:text-outline/50 outline-none ${errors.password ? "ring-2 ring-error" : ""}`}
                    placeholder="••••••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-error text-xs font-bold">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-secondary to-on-secondary-fixed-variant text-white font-headline font-bold rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.98] transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
              </button>
              {/* Register Link */}
              <div className="pt-6 text-center border-t border-surface-container-high mt-8">
                <p className="text-sm text-on-surface-variant">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    to="/registro"
                    className="text-secondary font-bold hover:text-on-secondary-fixed-variant transition-colors ml-1"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
