import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shareCode = searchParams.get("shareCode");

  if (!shareCode || typeof shareCode !== "string") {
    return Response.json(
      { error: "Share code is required" },
      { status: 400 }
    );
  }

  try {
    const board = await db
      .select({
        id: boards.id,
        name: boards.name,
        shareCode: boards.shareCode,
      })
      .from(boards)
      .where(eq(boards.shareCode, shareCode))
      .limit(1);

    if (!board.length) {
      return Response.json({ error: "Board not found" }, { status: 404 });
    }

    return Response.json(board[0]);
  } catch (error) {
    console.error("Error fetching board:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
