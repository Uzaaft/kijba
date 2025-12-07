import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards, columns } from "@/lib/db/schema";
import { verifyCollaboratorToken } from "@/lib/board";
import { headers, cookies } from "next/headers";
import { eq } from "drizzle-orm";

async function getColumnAccessCheck(
  boardId: string,
  columnId: string,
  userId?: string
) {
  const board = await db
    .select()
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);

  if (!board.length) {
    return { error: "Board not found", status: 404, column: null };
  }

  const column = await db
    .select()
    .from(columns)
    .where(eq(columns.id, columnId))
    .limit(1);

  if (!column.length) {
    return { error: "Column not found", status: 404, column: null };
  }

  if (column[0].boardId !== boardId) {
    return {
      error: "Column does not belong to this board",
      status: 400,
      column: null,
    };
  }

  // Allow board owner
  if (userId && board[0].ownerId === userId) {
    return { error: null, status: 200, column: column[0] };
  }

  // Check for valid collaborator token
  const cookieStore = await cookies();
  const token = cookieStore.get("collab_token")?.value;

  if (token) {
    const tokenBoardId = verifyCollaboratorToken(token);
    if (tokenBoardId === boardId) {
      return { error: null, status: 200, column: column[0] };
    }
  }

  return { error: "Unauthorized", status: 403, column: null };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { boardId, columnId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const { error, status } = await getColumnAccessCheck(
    boardId,
    columnId,
    userId
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  const body = await req.json();
  const { name, position } = body;

  const updateData: Record<string, unknown> = {};

  if (name && typeof name === "string" && name.trim()) {
    updateData.name = name.trim();
  }

  if (typeof position === "number") {
    updateData.position = position;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await db
    .update(columns)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(columns.id, columnId))
    .returning();

  return Response.json(updated[0]);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const { boardId, columnId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const { error, status } = await getColumnAccessCheck(
    boardId,
    columnId,
    userId
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  await db.delete(columns).where(eq(columns.id, columnId));

  return Response.json({ success: true });
}
