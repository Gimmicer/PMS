import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate, authorize(["notifications:read"]));

notificationsRouter.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({ where: { userId: req.user!.sub }, orderBy: { createdAt: "desc" } });
  res.json(notifications);
});

notificationsRouter.patch("/:id/read", async (req, res) => {
  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
  res.json(updated);
});
