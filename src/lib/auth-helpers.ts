import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PermissionRole } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

const roleHierarchy: Record<PermissionRole, number> = {
  VIEWER: 0,
  COMMENTER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

export async function checkPermission(
  userId: string,
  documentId: string,
  minimumRole: PermissionRole = "VIEWER"
): Promise<{ allowed: boolean; role: PermissionRole | "OWNER" }> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });

  if (!document) return { allowed: false, role: "VIEWER" };

  if (document.ownerId === userId) {
    return { allowed: true, role: "OWNER" };
  }

  const permission = await prisma.documentPermission.findUnique({
    where: { documentId_userId: { documentId, userId } },
  });

  if (!permission) return { allowed: false, role: "VIEWER" };

  const allowed = roleHierarchy[permission.role] >= roleHierarchy[minimumRole];
  return { allowed, role: permission.role };
}
