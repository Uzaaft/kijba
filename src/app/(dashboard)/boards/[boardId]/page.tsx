"use client";

import { useEffect, useState, useRef } from "react";
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

  const navbarRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null!);

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

  useEffect(() => {
    if (loading || !navbarRef.current || !boardContainerRef.current) return;

    const updateMargin = () => {
      if (!navbarRef.current || !boardContainerRef.current) return;
      const navbarMargin = window.getComputedStyle(navbarRef.current).marginLeft;
      boardContainerRef.current.style.paddingLeft = navbarMargin;
    };

    updateMargin();
    window.addEventListener("resize", updateMargin);
    return () => window.removeEventListener("resize", updateMargin);
  }, [loading]);

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
    <div className="min-h-screen bg-background w-full flex-1">
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
        <div ref={navbarRef} className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/boards")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {board.name}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="gap-2 shrink-0"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      <div className="py-6 overflow-x-auto">
        <Board
          boardId={boardId}
          initialColumns={columns}
          initialCards={cards}
          boardContainerRef={boardContainerRef}
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
