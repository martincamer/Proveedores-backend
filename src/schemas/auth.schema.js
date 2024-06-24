import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string({
      required_error: "El email es requerido",
      invalid_type_error: "El email debe ser un texto",
    })
    .email({
      message: "El email debe ser un email valido",
      invalid_type_error: "El email debe ser un texto",
    }),
  username: z
    .string({
      required_error: "El nombre de usuario es requerido",
    })
    .min(1)
    .max(255),
  password: z
    .string({
      required_error: "El nombre de usuario es requerido",
      invalid_type_error: "El nombre de usuario debe ser un texto",
    })
    .min(6, {
      message: "debe contener 6 caracteres",
    })
    .max(255),
});

export const signinSchema = z.object({
  email: z
    .string({
      required_error: "El email es requerido",
      invalid_type_error: "El email debe ser un texto",
    })
    .email({
      message: "El email debe ser un email valido",
    }),
  password: z
    .string({
      required_error: "El nombre de usuario es requerido",
      invalid_type_error: "El nombre de usuario debe ser un texto",
    })
    .min(6, {
      message: "La contraseña debe tener almenos 6 caracteres",
    })
    .max(255, {
      message: "La contraseña sobrepasa los caractares",
    }),
});
