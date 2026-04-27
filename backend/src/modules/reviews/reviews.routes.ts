import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";

export const reviewsRouter = Router();
reviewsRouter.use(authenticate);

reviewsRouter.post("/cycles", authorize(["reviews:write"]), async (req, res) => {
  const payload = z.object({ name: z.string(), periodStart: z.string().datetime(), periodEnd: z.string().datetime() }).parse(req.body);
  const cycle = await prisma.reviewCycle.create({ data: { ...payload, periodStart: new Date(payload.periodStart), periodEnd: new Date(payload.periodEnd), createdById: req.user!.sub } });
  res.status(201).json(cycle);
});

reviewsRouter.post("/", authorize(["reviews:write"]), async (req, res) => {
  const payload = z.object({ cycleId: z.string(), employeeId: z.string(), managerId: z.string(), goalId: z.string().optional() }).parse(req.body);
  const review = await prisma.review.create({ data: payload });
  res.status(201).json(review);
});

reviewsRouter.patch("/:id/self", authorize(["reviews:write"]), async (req, res) => {
  const id = String(req.params.id);
  const payload = z.object({ selfComment: z.string(), rating: z.number().min(1).max(5) }).parse(req.body);
  const review = await prisma.review.update({ where: { id }, data: { selfComment: payload.selfComment, rating: payload.rating, status: "SUBMITTED" } });
  res.json(review);
});

reviewsRouter.patch("/:id/manager", authorize(["reviews:write"]), async (req, res) => {
  const id = String(req.params.id);
  const payload = z.object({ managerComment: z.string(), rating: z.number().min(1).max(5) }).parse(req.body);
  const review = await prisma.review.update({ where: { id }, data: payload });
  res.json(review);
});

reviewsRouter.patch("/:id/approval", authorize(["reviews:approve"]), async (req, res) => {
  const id = String(req.params.id);
  const payload = z.object({ status: z.enum(["APPROVED", "REJECTED"]) }).parse(req.body);
  const review = await prisma.review.update({ where: { id }, data: { status: payload.status } });
  res.json(review);
});

reviewsRouter.get("/", authorize(["reviews:read"]), async (req, res) => {
  const reviews = await prisma.review.findMany({ include: { employee: true, manager: true, cycle: true }, take: Number(req.query.pageSize ?? 10), skip: (Number(req.query.page ?? 1) - 1) * Number(req.query.pageSize ?? 10) });
  res.json(reviews);
});
