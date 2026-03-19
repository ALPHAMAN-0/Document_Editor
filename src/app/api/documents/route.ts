import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "updatedAt";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const deleted = searchParams.get("deleted") === "true";

    const allowedSortFields = ["updatedAt", "createdAt", "title"] as const;
    const sortField = allowedSortFields.includes(sort as typeof allowedSortFields[number])
      ? (sort as typeof allowedSortFields[number])
      : "updatedAt";
    const sortDirection = sortField === "title" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const titleFilter = query
      ? { title: { contains: query, mode: "insensitive" as const } }
      : {};

    const deletedFilter = deleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null };

    const whereClause = {
      AND: [
        titleFilter,
        deletedFilter,
        {
          OR: [
            { ownerId: user.id },
            {
              permissions: {
                some: { userId: user.id },
              },
            },
          ],
        },
      ],
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
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
        orderBy: { [sortField]: sortDirection },
        skip,
        take: limit,
      }),
      prisma.document.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "Untitled Document";

    const document = await prisma.document.create({
      data: {
        title,
        ownerId: user.id,
        content: "",
        contentHtml: "",
        wordCount: 0,
      },
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
