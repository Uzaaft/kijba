import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { hashPassword, generateShareCode, generateDefaultPassword } from "@/lib/board";

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const { error, status, board } = await getBoardOwnerCheck(
    boardId,
    session.user.id
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  return Response.json(board);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const { error, status, board } = await getBoardOwnerCheck(
    boardId,
    session.user.id
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  const body = await req.json();
  const { name, regeneratePassword } = body;

  const updateData: any = {};
  let generatedPassword: string | undefined;

  if (name && typeof name === "string" && name.trim().length > 0) {
    updateData.name = name.trim();
  }

  if (regeneratePassword === true) {
    generatedPassword = generateDefaultPassword();
    const newPasswordHash = await hashPassword(generatedPassword);
    const newShareCode = generateShareCode();
    updateData.shareCode = newShareCode;
    updateData.passwordHash = newPasswordHash;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await db
    .update(boards)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(boards.id, boardId))
    .returning();

  return Response.json({
    ...updated[0],
    generatedPassword,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const { error, status } = await getBoardOwnerCheck(
    boardId,
    session.user.id
  );

  if (error) {
    return Response.json({ error }, { status });
  }

  await db.delete(boards).where(eq(boards.id, boardId));

  return Response.json({ success: true });
}
