export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  permissions: string[];
};
