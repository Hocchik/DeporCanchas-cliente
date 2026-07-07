import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth";

describe("registerSchema", () => {
  const base = {
    nombre: "Joseph Gonzales",
    email: "joseph@example.com",
    dni: "12345678",
    clave: "clave1234",
  };

  it("acepta datos válidos sin celular", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("acepta celular válido de 9 dígitos", () => {
    expect(registerSchema.safeParse({ ...base, celular: "987654321" }).success).toBe(true);
  });

  it("normaliza el email a minúsculas", () => {
    const r = registerSchema.safeParse({ ...base, email: "Joseph@Example.com" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("joseph@example.com");
  });

  it("rechaza DNI con menos de 8 dígitos", () => {
    expect(registerSchema.safeParse({ ...base, dni: "1234567" }).success).toBe(false);
  });

  it("rechaza DNI con letras", () => {
    expect(registerSchema.safeParse({ ...base, dni: "1234567A" }).success).toBe(false);
  });

  it("rechaza celular con menos de 9 dígitos", () => {
    expect(registerSchema.safeParse({ ...base, celular: "12345" }).success).toBe(false);
  });

  it("rechaza clave menor a 8 caracteres", () => {
    expect(registerSchema.safeParse({ ...base, clave: "1234567" }).success).toBe(false);
  });

  it("rechaza email inválido", () => {
    expect(registerSchema.safeParse({ ...base, email: "no-es-un-email" }).success).toBe(false);
  });

  it("rechaza nombre muy corto", () => {
    expect(registerSchema.safeParse({ ...base, nombre: "Jo" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("acepta email y clave válidos", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", clave: "x" }).success).toBe(true);
  });

  it("rechaza clave vacía", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", clave: "" }).success).toBe(false);
  });

  it("rechaza email inválido", () => {
    expect(loginSchema.safeParse({ email: "no-es-email", clave: "x" }).success).toBe(false);
  });
});
