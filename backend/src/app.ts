import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { env } from "./config/env.js";
import { errorHandler } from "./lib/errors.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { goalsRouter } from "./modules/goals/goals.routes.js";
import { reviewsRouter } from "./modules/reviews/reviews.routes.js";
import { feedbackRouter } from "./modules/feedback/feedback.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

export const app = express();
const swaggerPath = fileURLToPath(new URL("../openapi.yaml", import.meta.url));
const swaggerSpec = existsSync(swaggerPath) ? YAML.load(swaggerPath) : { openapi: "3.0.3", info: { title: "PMS API", version: "1.0.0" } };

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);
