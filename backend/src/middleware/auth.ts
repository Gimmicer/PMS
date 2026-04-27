import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthPayload = { sub: string; roles: string[]; permissions: string[] };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions ?? [];
    const allowed = required.every((item) => permissions.includes(item));
    if (!allowed) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
