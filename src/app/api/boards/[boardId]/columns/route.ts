import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards, columns } from "@/lib/db/schema";
import { verifyCollaboratorToken } from "@/lib/board";
import { broadcastBoardEvent } from "@/lib/sse-events";
import { headers, cookies } from "next/headers";
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

async function getBoardAccessCheck(boardId: string, userId?: string) {
  const board = await db
    .select()
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);

  if (!board.length) {
    return { error: "Board not found", status: 404, board: null };
  }

  // Allow board owner
  if (userId && board[0].ownerId === userId) {
    return { error: null, status: 200, board: board[0] };
  }

  // Check for valid collaborator token
  const cookieStore = await cookies();
  const token = cookieStore.get("collab_token")?.value;

  if (token) {
    const tokenBoardId = verifyCollaboratorToken(token);
    if (tokenBoardId === boardId) {
      return { error: null, status: 200, board: board[0] };
    }
  }

  return { error: "Unauthorized", status: 403, board: null };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get("public") === "true";

  if (!isPublic) {
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
  } else {
    // For public access, verify the board exists
    const board = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId))
      .limit(1);

    if (!board.length) {
      return Response.json({ error: "Board not found" }, { status: 404 });
    }
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

  const userId = session?.user?.id;
  const { error, status } = await getBoardAccessCheck(boardId, userId);

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

  // Broadcast to all connected clients
  broadcastBoardEvent(boardId, "column:created", newColumn[0]);

  return Response.json(newColumn[0], { status: 201 });
}
