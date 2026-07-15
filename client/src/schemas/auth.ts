import { z } from "zod";

export const signupSchema = z.object({
  email: z.email("Invalid email address"),
});

export const forgetPasswordScehma = signupSchema;

export const setPasswordSchema = z
  .object({
    password: z
      .string("Password is missing")
      .min(8, "Password must be at least 8 characters long")
      .max(32, "Password cannot exceed 32 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z
      .string("Confirm Password is missing")
      .min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const resetPasswordSchema = setPasswordSchema;

export const signinSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password cannot exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export interface User {
  name: string;
  avatarUrl: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export type SignupFormData = z.infer<typeof signupSchema>;
export type SetPasswordData = z.infer<typeof setPasswordSchema>;
export type ForgetPasswordData = z.infer<typeof forgetPasswordScehma>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
