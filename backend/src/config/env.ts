import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, fallback: string): string => {
  if (value && value.trim().length > 0) {
    return value.trim();
  }

  return fallback;
};

export const env = {
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  databasePath: required(
    process.env.ROMANTIC_DB_PATH,
    new URL("../data/romance.db", import.meta.url).pathname,
  ),
  jwtSecret: required(process.env.ROMANTIC_JWT_SECRET, "super-romantic-secret"),
  sessionDurationMinutes: Number.parseInt(
    process.env.ROMANTIC_SESSION_MINUTES ?? "240",
    10,
  ),
  initialUserEmail: required(process.env.ROMANTIC_ADMIN_EMAIL, "amor@mimujer.local"),
  initialUserPassword: required(process.env.ROMANTIC_ADMIN_PASSWORD, "nuestrosecreto"),
  uploadsDir: required(
    process.env.ROMANTIC_UPLOADS_DIR,
    new URL("../../uploads", import.meta.url).pathname,
  ),
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : undefined,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "no-reply@mimujer.local",
  },
};

export type AppEnv = typeof env;
