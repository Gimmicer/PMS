import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../../middleware/auth.js";

const signupSchema = z.object({ email: z.email(), name: z.string().min(2), password: z.string().min(8) });
const loginSchema = z.object({ email: z.email(), password: z.string().min(8) });

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const refreshTtlMs = () => env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, refreshToken: string) {
  if (!env.USE_REFRESH_COOKIE) return;
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: refreshTtlMs()
  });
}

function readRefreshToken(req: Request) {
  if (typeof req.body?.refreshToken === "string") return req.body.refreshToken;
  const cookieToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
  return typeof cookieToken === "string" ? cookieToken : undefined;
}

async function buildUserClaims(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } }
  });
  const roles = userRoles.map((r: (typeof userRoles)[number]) => r.role.name);
  const permissions = [...new Set(userRoles.flatMap((r: (typeof userRoles)[number]) => r.role.permissions.map((p: (typeof userRoles)[number]["role"]["permissions"][number]) => p.permission.key)))];
  return { roles, permissions };
}

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const payload = signupSchema.parse(req.body);
  const pass = await bcrypt.hash(payload.password, 10);
  const employeeRole = await prisma.role.findUniqueOrThrow({ where: { name: "EMPLOYEE" } });
  const user = await prisma.user.create({ data: { email: payload.email, name: payload.name, passwordHash: pass } });
  await prisma.userRole.create({ data: { userId: user.id, roleId: employeeRole.id } });
  res.status(201).json({ id: user.id, email: user.email });
});

authRouter.post("/login", async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const claims = await buildUserClaims(user.id);
  const accessToken = jwt.sign(
    { sub: user.id, ...claims },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"] }
  );
  const refreshToken = jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d` });

  await prisma.refreshTokenSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTtlMs())
    }
  });
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, roles: claims.roles, permissions: claims.permissions } });
});

authRouter.post("/refresh", async (req, res) => {
  const token = readRefreshToken(req);
  if (!token) return res.status(400).json({ error: "refreshToken required" });

  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  const session = await prisma.refreshTokenSession.findFirst({
    where: {
      userId: decoded.sub,
      tokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
  if (!session) return res.status(401).json({ error: "Invalid session" });

  await prisma.refreshTokenSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() }
  });

  const claims = await buildUserClaims(decoded.sub);
  const accessToken = jwt.sign(
    { sub: decoded.sub, ...claims },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"] }
  );
  const refreshToken = jwt.sign({ sub: decoded.sub }, env.JWT_REFRESH_SECRET, { expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d` });
  await prisma.refreshTokenSession.create({
    data: {
      userId: decoded.sub,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTtlMs())
    }
  });
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, refreshToken });
});

authRouter.post("/logout", async (req, res) => {
  const token = readRefreshToken(req);
  if (token) {
    await prisma.refreshTokenSession.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
  if (env.USE_REFRESH_COOKIE) {
    res.clearCookie(env.REFRESH_COOKIE_NAME);
  }
  res.status(204).send();
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { id: true, email: true, name: true } });
  res.json({ ...user, roles: req.user?.roles, permissions: req.user?.permissions });
});
