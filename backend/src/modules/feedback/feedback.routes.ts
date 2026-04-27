import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";

export const feedbackRouter = Router();
feedbackRouter.use(authenticate);

feedbackRouter.post("/", authorize(["feedback:write"]), async (req, res) => {
  const payload = z.object({ targetId: z.string(), message: z.string().min(2) }).parse(req.body);
  const feedback = await prisma.feedback.create({ data: { authorId: req.user!.sub, ...payload } });
  res.status(201).json(feedback);
});

feedbackRouter.get("/", authorize(["feedback:read"]), async (req, res) => {
  const feedback = await prisma.feedback.findMany({ where: req.query.targetId ? { targetId: String(req.query.targetId) } : undefined, include: { author: true, target: true }, orderBy: { createdAt: "desc" }, take: Number(req.query.pageSize ?? 10), skip: (Number(req.query.page ?? 1) - 1) * Number(req.query.pageSize ?? 10) });
  res.json(feedback);
});
