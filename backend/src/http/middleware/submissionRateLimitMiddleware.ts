import { Response, NextFunction, RequestHandler } from "express";
import { Redis } from "ioredis";
import { AuthenticatedRequest } from "./authMiddleware";

export function createSubmissionRateLimiter(redis: Redis): RequestHandler {
  const max = Number(process.env.SUBMISSION_RATE_LIMIT_MAX ?? 5);
  const windowSeconds = Number(process.env.SUBMISSION_RATE_LIMIT_WINDOW_SECONDS ?? 60);

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!;
    const key = `rl:submit:${userId}`;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > max) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        message: `Too many submissions. Try again in ${ttl} second(s).`,
      });
    }

    next();
  };
}
