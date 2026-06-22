import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser, login as loginApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});
type RegisterForm = z.infer<typeof registerSchema>;
export default function RegisterPage() {
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const {
    register: fieldRegister,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const password = watch("password", "");
  const getStrengthLevel = () => {
    if (password.length < 4) return { label: "Baja", color: "text-error" };
    if (password.length < 8)
      return { label: "Media", color: "text-tertiary-fixed-dim" };
    if (password.length < 12)
      return { label: "Media-Alta", color: "text-secondary" };
    return { label: "Alta", color: "text-secondary" };
  };
  const getStrengthBars = () => [
    password.length > 0,
    password.length >= 4,
    password.length >= 8,
    password.length >= 12,
  ];
  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      await registerUser(data.email, data.password, data.nombre);
      const authData = await loginApi(data.email, data.password);
      login(
        { id: authData.id, nombre: authData.nombre, rol: authData.rol },
        authData.token,
      );
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.detail || "Error al crear la cuenta");
    }
  };
  const strength = password.length > 0 ? getStrengthLevel() : null;
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
                  La precisión es nuestra lógica
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Únete a la red logística más avanzada del mercado. Optimiza
                  cada movimiento con inteligencia de datos en tiempo real.
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
                Comienza ahora
              </h2>
              <p className="text-on-surface-variant font-medium">
                Regístrate para gestionar tus flujos logísticos con precisión.
              </p>
            </div>
            {serverError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-bold">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  Nombre completo
                </label>
                <input
                  {...fieldRegister("nombre")}
                  className={`w-full px-4 py-3 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all placeholder:text-outline/50 outline-none ${errors.nombre ? "ring-2 ring-error" : ""}`}
                  placeholder="Tu nombre completo"
                />
                {errors.nombre && (
                  <p className="text-error text-xs font-bold">
                    {errors.nombre.message}
                  </p>
                )}
              </div>
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
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {getStrengthBars().map((active, i) => (
                      <div
                        key={i}
                        className={`rounded-full flex-1 ${active ? "bg-secondary-fixed-dim" : "bg-surface-container-highest"}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    {strength && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${strength.color}`}
                      >
                        Seguridad: {strength.label}
                      </span>
                    )}
                    <span className="text-[10px] text-on-surface-variant italic">
                      Mínimo 8 caracteres
                    </span>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-error text-xs font-bold">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Terms */}
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  {...fieldRegister("acceptTerms")}
                  className="h-4 w-4 rounded border-outline-variant text-secondary cursor-pointer mt-0.5 accent-[#006c49]"
                />
                <label className="text-sm text-on-surface-variant leading-tight">
                  Acepto los{" "}
                  <a
                    href="#"
                    className="text-primary font-bold hover:underline"
                  >
                    términos y condiciones
                  </a>{" "}
                  y la{" "}
                  <a
                    href="#"
                    className="text-primary font-bold hover:underline"
                  >
                    política de privacidad
                  </a>{" "}
                  de Smart Logix.
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-error text-xs font-bold">
                  {errors.acceptTerms.message}
                </p>
              )}
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-secondary to-on-secondary-fixed-variant text-white font-headline font-bold rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.98] transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"}
              </button>
              {/* Login Link */}
              <div className="pt-6 text-center border-t border-surface-container-high mt-8">
                <p className="text-sm text-on-surface-variant">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-secondary font-bold hover:text-on-secondary-fixed-variant transition-colors ml-1"
                  >
                    Inicia sesión aquí
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
