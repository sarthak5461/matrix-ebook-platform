import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export const forgotSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
});
