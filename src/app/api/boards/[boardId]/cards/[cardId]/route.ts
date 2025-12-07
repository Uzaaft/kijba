import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards, columns, cards } from "@/lib/db/schema";
import { verifyCollaboratorToken } from "@/lib/board";
import { broadcastBoardEvent } from "@/lib/sse-events";
import { headers, cookies } from "next/headers";
import { eq } from "drizzle-orm";

async function getCardAccessCheck(
  boardId: string,
  cardId: string,
  userId?: string
) {
  const board = await db
    .select()
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);

  if (!board.length) {
    return { error: "Board not found", status: 404, card: null };
  }

  const card = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  if (!card.length) {
    return { error: "Card not found", status: 404, card: null };
  }

  // Verify card's column belongs to this board
  const column = await db
    .select()
    .from(columns)
    .where(eq(columns.id, card[0].columnId))
    .limit(1);

  if (!column.length || column[0].boardId !== boardId) {
    return {
      error: "Card does not belong to this board",
      status: 400,
      card: null,
    };
  }

  // Allow board owner
  if (userId && board[0].ownerId === userId) {
    return { error: null, status: 200, card: card[0] };
  }

  // Check for valid collaborator token
  const cookieStore = await cookies();
  const token = cookieStore.get("collab_token")?.value;

  if (token) {
    const tokenBoardId = verifyCollaboratorToken(token);
    if (tokenBoardId === boardId) {
      return { error: null, status: 200, card: card[0] };
    }
  }

  return { error: "Unauthorized", status: 403, card: null };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  const { boardId, cardId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const { error, status } = await getCardAccessCheck(boardId, cardId, userId);

  if (error) {
    return Response.json({ error }, { status });
  }

  const body = await req.json();
  const { content, position, color, columnId } = body;

  const updateData: Record<string, unknown> = {};

  if (content && typeof content === "string" && content.trim()) {
    updateData.content = content.trim();
  }

  if (typeof position === "number") {
    updateData.position = position;
  }

  if (color && typeof color === "string") {
    updateData.color = color;
  }

  if (columnId && typeof columnId === "string") {
    // Verify new column belongs to the same board
    const newColumn = await db
      .select()
      .from(columns)
      .where(eq(columns.id, columnId))
      .limit(1);

    if (!newColumn.length || newColumn[0].boardId !== boardId) {
      return Response.json(
        { error: "Invalid target column" },
        { status: 400 }
      );
    }

    updateData.columnId = columnId;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await db
    .update(cards)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(cards.id, cardId))
    .returning();

  // Broadcast to all connected clients
  broadcastBoardEvent(boardId, "card:updated", updated[0]);

  return Response.json(updated[0]);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  const { boardId, cardId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const { error, status } = await getCardAccessCheck(boardId, cardId, userId);

  if (error) {
    return Response.json({ error }, { status });
  }

  const deletedCard = await db
    .delete(cards)
    .where(eq(cards.id, cardId))
    .returning();

  // Broadcast to all connected clients
  if (deletedCard.length) {
    broadcastBoardEvent(boardId, "card:deleted", { id: cardId });
  }

  return Response.json({ success: true });
}
