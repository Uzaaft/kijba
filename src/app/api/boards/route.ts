import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import {
  generateShareCode,
  hashPassword,
  generateDefaultPassword,
} from "@/lib/board";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userBoards = await db
    .select()
    .from(boards)
    .where(eq(boards.ownerId, session.user.id));

  return Response.json(userBoards);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, password } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Board name is required" }, { status: 400 });
  }

  const boardPassword = password || generateDefaultPassword();
  const passwordHash = await hashPassword(boardPassword);
  const shareCode = generateShareCode();

  const newBoard = await db
    .insert(boards)
    .values({
      name: name.trim(),
      ownerId: session.user.id,
      shareCode,
      passwordHash,
    })
    .returning();

  return Response.json(
    {
      ...newBoard[0],
      generatedPassword: password ? undefined : boardPassword,
    },
    { status: 201 }
  );
}
