import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const goalSchema = z.object({ title: z.string().min(2), description: z.string().optional(), targetValue: z.number().optional(), ownerId: z.string(), dueDate: z.string().datetime().optional() });

export const goalsRouter = Router();
goalsRouter.use(authenticate);

goalsRouter.get("/", authorize(["goals:read"]), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);
  const ownerId = req.query.ownerId as string | undefined;
  const goals = await prisma.goal.findMany({ where: ownerId ? { ownerId } : undefined, include: { owner: true }, skip: (page - 1) * pageSize, take: pageSize });
  res.json(goals);
});

goalsRouter.post("/", authorize(["goals:write"]), async (req, res) => {
  const payload = goalSchema.parse(req.body);
  const goal = await prisma.goal.create({ data: { ...payload, creatorId: req.user!.sub, dueDate: payload.dueDate ? new Date(payload.dueDate) : null } });
  res.status(201).json(goal);
});

goalsRouter.patch("/:id/progress", authorize(["goals:write"]), async (req, res) => {
  const id = String(req.params.id);
  const payload = z.object({ progress: z.number().min(0).max(100) }).parse(req.body);
  const goal = await prisma.goal.update({ where: { id }, data: { progress: payload.progress } });
  res.json(goal);
});
