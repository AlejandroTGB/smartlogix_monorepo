import { afterEach, describe, expect, test } from "vitest";

import { useAuthStore } from "./authStore";

const usuario = {
  id: 1,
  nombre: "Admin",
  rol: "admin",
};

afterEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
});

describe("authStore", () => {
  test("login guarda usuario y token en estado y localStorage", () => {
    useAuthStore.getState().login(usuario, "jwt-token");

    const estado = useAuthStore.getState();

    expect(estado.user).toEqual(usuario);
    expect(estado.token).toBe("jwt-token");
    expect(estado.isAuthenticated).toBe(true);
    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(localStorage.getItem("user")).toBe(JSON.stringify(usuario));
  });

  test("logout limpia estado y localStorage", () => {
    useAuthStore.getState().login(usuario, "jwt-token");

    useAuthStore.getState().logout();

    const estado = useAuthStore.getState();

    expect(estado.user).toBeNull();
    expect(estado.token).toBeNull();
    expect(estado.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
