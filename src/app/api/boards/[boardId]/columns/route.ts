import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards, columns } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

async function getBoardOwnerCheck(boardId: string, userId: string) {
  const board = await db
    .select()
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);

  if (!board.length) {
    return { error: "Board not found", status: 404, board: null };
  }

  if (board[0].ownerId !== userId) {
    return { error: "Unauthorized", status: 403, board: null };
  }

  return { error: null, status: 200, board: board[0] };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error, status } = await getBoardOwnerCheck(
    boardId,
    session.user.id
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  const columnList = await db
    .select()
    .from(columns)
    .where(eq(columns.boardId, boardId));

  return Response.json(columnList);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error, status } = await getBoardOwnerCheck(
    boardId,
    session.user.id
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json(
      { error: "Column name is required" },
      { status: 400 }
    );
  }

  // Get the highest position
  const existingColumns = await db
    .select()
    .from(columns)
    .where(eq(columns.boardId, boardId));

  const nextPosition =
    existingColumns.length > 0
      ? Math.max(...existingColumns.map((c) => c.position)) + 1
      : 0;

  const newColumn = await db
    .insert(columns)
    .values({
      boardId,
      name: name.trim(),
      position: nextPosition,
    })
    .returning();

  return Response.json(newColumn[0], { status: 201 });
}
