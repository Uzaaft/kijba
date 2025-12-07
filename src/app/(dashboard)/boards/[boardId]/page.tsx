"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Board } from "@/components/board/board";
import { BoardSettingsModal } from "@/components/board/board-settings-modal";
import { Settings, ArrowLeft } from "lucide-react";

interface BoardData {
  id: string;
  name: string;
  ownerId: string;
}

interface ColumnData {
  id: string;
  name: string;
  position: number;
  boardId: string;
}

interface CardData {
  id: string;
  columnId: string;
  content: string;
  position: number;
  color: string;
}

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<BoardData | null>(null);
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        // Load board
        const boardRes = await fetch(`/api/boards/${boardId}`);
        if (!boardRes.ok) throw new Error("Failed to load board");
        const boardData = await boardRes.json();
        setBoard(boardData);

        // Load columns
        const columnsRes = await fetch(`/api/boards/${boardId}/columns`);
        if (!columnsRes.ok) throw new Error("Failed to load columns");
        const columnsData = await columnsRes.json();
        setColumns(columnsData);

        // Load cards
        const cardsRes = await fetch(`/api/boards/${boardId}/cards`);
        if (!cardsRes.ok) throw new Error("Failed to load cards");
        const cardsData = await cardsRes.json();
        setCards(cardsData);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load board"
        );
        router.push("/boards");
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container max-w-full px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/boards")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{board.name}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="container max-w-full px-4 py-6 overflow-x-auto">
        <Board
          boardId={boardId}
          initialColumns={columns}
          initialCards={cards}
        />
      </div>

      <BoardSettingsModal
        boardId={boardId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onBoardDeleted={() => router.push("/boards")}
      />
    </div>
  );
}
