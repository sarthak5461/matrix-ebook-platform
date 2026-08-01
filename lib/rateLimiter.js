import { RateLimiterMemory } from "rate-limiter-flexible";

const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
});

const registerLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60,
});

const forgotPasswordLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60,
});

const paymentLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

export const limiters = {
  login: loginLimiter,
  register: registerLimiter,
  forgotPassword: forgotPasswordLimiter,
  payment: paymentLimiter,
};

export async function applyRateLimit(request, limiter) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  try {
    await limiter.consume(ip);
    return null;
  } catch {
    return Response.json(
      {
        error: "Too many requests. Please try again later.",
      },
      { status: 429 },
    );
  }
}
