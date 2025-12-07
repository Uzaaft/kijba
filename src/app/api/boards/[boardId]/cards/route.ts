import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards, columns, cards } from "@/lib/db/schema";
import { verifyCollaboratorToken } from "@/lib/board";
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
  }

  // For public access, just verify the board exists
  const board = await db
    .select()
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);

  if (!board.length) {
    return Response.json({ error: "Board not found" }, { status: 404 });
  }

  // Join with columns to get all cards for this board
  const cardList = await db
    .select()
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id))
    .where(eq(columns.boardId, boardId));

  return Response.json(cardList.map((item) => item.cards));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is authenticated owner OR has valid collaborator token
  const userId = session?.user?.id;
  const { error, status } = await getBoardAccessCheck(boardId, userId);

  if (error) {
    return Response.json({ error }, { status });
  }

  const body = await req.json();
  const { columnId, content, color } = body;

  if (!columnId || typeof columnId !== "string") {
    return Response.json(
      { error: "Column ID is required" },
      { status: 400 }
    );
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return Response.json(
      { error: "Card content is required" },
      { status: 400 }
    );
  }

  // Verify column belongs to this board
  const column = await db
    .select()
    .from(columns)
    .where(eq(columns.id, columnId))
    .limit(1);

  if (!column.length || column[0].boardId !== boardId) {
    return Response.json(
      { error: "Column does not belong to this board" },
      { status: 400 }
    );
  }

  // Get the highest position in this column
  const existingCards = await db
    .select()
    .from(cards)
    .where(eq(cards.columnId, columnId));

  const nextPosition =
    existingCards.length > 0
      ? Math.max(...existingCards.map((c) => c.position)) + 1
      : 0;

  const newCard = await db
    .insert(cards)
    .values({
      columnId,
      content: content.trim(),
      position: nextPosition,
      color: color || "#d4a574",
    })
    .returning();

  return Response.json(newCard[0], { status: 201 });
}
