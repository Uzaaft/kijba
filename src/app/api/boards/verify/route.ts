import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { verifyPassword, generateCollaboratorToken } from "@/lib/board";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { password, shareCode } = body;

  if (!password || typeof password !== "string") {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  if (!shareCode || typeof shareCode !== "string") {
    return Response.json({ error: "Share code is required" }, { status: 400 });
  }

  try {
    const board = await db
      .select()
      .from(boards)
      .where(eq(boards.shareCode, shareCode))
      .limit(1);

    if (!board.length) {
      return Response.json({ error: "Board not found" }, { status: 404 });
    }

    const isValid = await verifyPassword(password, board[0].passwordHash);

    if (!isValid) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate collaborator token
    const token = generateCollaboratorToken(board[0].id);

    // Set token as httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("collab_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return Response.json({ success: true, boardId: board[0].id });
  } catch (error) {
    console.error("Password verification error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
