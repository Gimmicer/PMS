import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { authenticate, authorize } from "../../src/middleware/auth.js";

describe("auth middleware", () => {
  it("rejects missing bearer token", () => {
    const req = { headers: {} } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows valid bearer token", () => {
    const token = jwt.sign({ sub: "u1", roles: ["ADMIN"], permissions: ["users:read"] }, process.env.JWT_ACCESS_SECRET ?? "test_access_secret_123456");
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.sub).toBe("u1");
  });

  it("forbids when required permission missing", () => {
    const req = { user: { permissions: ["goals:read"] } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    authorize(["users:write"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
