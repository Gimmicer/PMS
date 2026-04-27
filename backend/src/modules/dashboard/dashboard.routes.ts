import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get("/admin", async (_req, res) => {
  const [users, goals, reviews] = await Promise.all([prisma.user.count(), prisma.goal.count(), prisma.review.count()]);
  res.json({ users, goals, reviews });
});

dashboardRouter.get("/manager", async (req, res) => {
  const teamReviews = await prisma.review.count({ where: { managerId: req.user!.sub } });
  const pendingReviews = await prisma.review.count({ where: { managerId: req.user!.sub, status: "SUBMITTED" } });
  res.json({ teamReviews, pendingReviews });
});

dashboardRouter.get("/employee", async (req, res) => {
  const myGoals = await prisma.goal.count({ where: { ownerId: req.user!.sub } });
  const myReviews = await prisma.review.count({ where: { employeeId: req.user!.sub } });
  res.json({ myGoals, myReviews });
});
