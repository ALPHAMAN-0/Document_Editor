import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, checkPermission } from "@/lib/auth-helpers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const { allowed } = await checkPermission(user.id, id, "VIEWER");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/documents/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const { allowed } = await checkPermission(user.id, id, "EDITOR");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const allowedFields = ["title", "content", "contentHtml", "wordCount"] as const;
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        if (field === "wordCount") {
          const wordCount = parseInt(body.wordCount, 10);
          if (isNaN(wordCount) || wordCount < 0) {
            return NextResponse.json(
              { error: "wordCount must be a non-negative integer" },
              { status: 400 }
            );
          }
          updateData[field] = wordCount;
        } else if (typeof body[field] === "string") {
          updateData[field] = field === "title" ? body[field].trim() : body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    if ("title" in updateData && !(updateData.title as string)) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/documents/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const document = await prisma.document.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only the document owner can delete this document" },
        { status: 403 }
      );
    }

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Document moved to trash" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
