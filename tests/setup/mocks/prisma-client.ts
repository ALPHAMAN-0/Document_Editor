// Stand-in for `@prisma/client`, which only exists after `prisma generate`.
export const PermissionRole = {
  VIEWER: "VIEWER",
  COMMENTER: "COMMENTER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
} as const;
