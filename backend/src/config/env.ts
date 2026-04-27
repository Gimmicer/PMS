import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().default(7),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  USE_REFRESH_COOKIE: z.coerce.boolean().default(true),
  REFRESH_COOKIE_NAME: z.string().default("pms_refresh_token")
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(process.env);
