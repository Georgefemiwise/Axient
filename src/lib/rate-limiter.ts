import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

// In-memory rate limiter for development
const rateLimiterMemory = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// API rate limiter
export const apiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'api',
  points: 50, // Number of requests
  duration: 60, // Per 60 seconds
});

// Authentication rate limiter
export const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 5, // Number of attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

// SMS notification rate limiter
export const smsRateLimiter = new RateLimiterMemory({
  keyPrefix: 'sms',
  points: 10, // Number of SMS
  duration: 3600, // Per hour
});

export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<{ allowed: boolean; remainingPoints?: number; msBeforeNext?: number }> {
  try {
    const result = await limiter.consume(key);
    return {
      allowed: true,
      remainingPoints: result.remainingPoints,
      msBeforeNext: result.msBeforeNext,
    };
  } catch (rejRes: any) {
    return {
      allowed: false,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext,
    };
  }
}