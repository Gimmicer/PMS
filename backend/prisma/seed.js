import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const permissionKeys = [
    "users:read", "users:write", "goals:read", "goals:write", "reviews:read", "reviews:write", "reviews:approve", "feedback:read", "feedback:write", "notifications:read"
];
async function main() {
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    const permissions = await Promise.all(permissionKeys.map((key) => prisma.permission.create({ data: { key } })));
    const byKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]));
    const admin = await prisma.role.create({ data: { name: "ADMIN" } });
    const manager = await prisma.role.create({ data: { name: "MANAGER" } });
    const employee = await prisma.role.create({ data: { name: "EMPLOYEE" } });
    const link = async (roleId, keys) => Promise.all(keys.map((key) => prisma.rolePermission.create({ data: { roleId, permissionId: byKey[key] } })));
    await link(admin.id, permissionKeys);
    await link(manager.id, ["goals:read", "goals:write", "reviews:read", "reviews:write", "reviews:approve", "feedback:read", "feedback:write", "notifications:read"]);
    await link(employee.id, ["goals:read", "reviews:read", "reviews:write", "feedback:read", "feedback:write", "notifications:read"]);
    const dept = await prisma.department.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering" } });
    const pass = await bcrypt.hash("Password123!", 10);
    const adminUser = await prisma.user.upsert({ where: { email: "admin@pms.local" }, update: {}, create: { email: "admin@pms.local", name: "System Admin", passwordHash: pass, departmentId: dept.id } });
    const managerUser = await prisma.user.upsert({ where: { email: "manager@pms.local" }, update: {}, create: { email: "manager@pms.local", name: "Team Manager", passwordHash: pass, departmentId: dept.id } });
    const employeeUser = await prisma.user.upsert({ where: { email: "employee@pms.local" }, update: {}, create: { email: "employee@pms.local", name: "Employee One", passwordHash: pass, departmentId: dept.id } });
    await prisma.userRole.createMany({ data: [{ userId: adminUser.id, roleId: admin.id }, { userId: managerUser.id, roleId: manager.id }, { userId: employeeUser.id, roleId: employee.id }], skipDuplicates: true });
}
main().finally(async () => prisma.$disconnect());
