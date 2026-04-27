import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const querySchema = z.object({ page: z.coerce.number().default(1), pageSize: z.coerce.number().default(10), q: z.string().optional() });

export const usersRouter = Router();
usersRouter.use(authenticate, authorize(["users:read"]));

usersRouter.get("/", async (req, res) => {
  const query = querySchema.parse(req.query);
  const where = query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" as const } }, { email: { contains: query.q, mode: "insensitive" as const } }] } : {};
  const users = await prisma.user.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: { roles: { include: { role: true } }, department: true } });
  res.json(users);
});

usersRouter.post("/:id/roles", authorize(["users:write"]), async (req, res) => {
  const userId = String(req.params.id);
  const roleIds = z.object({ roleIds: z.array(z.string()).min(1) }).parse(req.body);
  await prisma.userRole.deleteMany({ where: { userId } });
  await prisma.userRole.createMany({ data: roleIds.roleIds.map((roleId) => ({ userId, roleId })) });
  res.status(204).send();
});
