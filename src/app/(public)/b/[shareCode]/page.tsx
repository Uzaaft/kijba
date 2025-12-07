"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Board } from "@/components/board/board";
import { PasswordModal } from "@/components/board/password-modal";
import { ArrowLeft } from "lucide-react";

interface BoardData {
  id: string;
  name: string;
  shareCode: string;
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

export default function PublicBoardPage() {
  const router = useRouter();
  const params = useParams();
  const shareCode = params.shareCode as string;

  const [board, setBoard] = useState<BoardData | null>(null);
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      if (shareCode) {
        const accessKey = `board_access_${shareCode}`;
        const hasStoredAccess = sessionStorage.getItem(accessKey) === "true";
        setHasAccess(hasStoredAccess);
        if (!hasStoredAccess) {
          setPasswordModalOpen(true);
        }
      }
    };

    checkAccess();
  }, [shareCode]);

  useEffect(() => {
    if (!hasAccess) return;

    const loadBoard = async () => {
      try {
        // Fetch board by share code
        const boardRes = await fetch(
          `/api/public/boards?shareCode=${encodeURIComponent(shareCode)}`
        );
        if (!boardRes.ok) throw new Error("Failed to load board");
        const boardData = await boardRes.json();
        setBoard(boardData);

        const boardId = boardData.id;

        // Load columns
        const columnsRes = await fetch(
          `/api/boards/${boardId}/columns?public=true`
        );
        if (!columnsRes.ok) throw new Error("Failed to load columns");
        const columnsData = await columnsRes.json();
        setColumns(columnsData);

        // Load cards
        const cardsRes = await fetch(
          `/api/boards/${boardId}/cards?public=true`
        );
        if (!cardsRes.ok) throw new Error("Failed to load cards");
        const cardsData = await cardsRes.json();
        setCards(cardsData);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load board"
        );
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [shareCode, hasAccess, router]);

  const handlePasswordSuccess = () => {
    setHasAccess(true);
    const accessKey = `board_access_${shareCode}`;
    sessionStorage.setItem(accessKey, "true");
  };

  if (!hasAccess && !loading) {
    return null;
  }

  if (loading && hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  if (!board && hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background w-full">
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="container max-w-full px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">
                {board?.name || "Loading..."}
              </h1>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Shared Board
              </span>
            </div>
          </div>
        </div>

        {board && (
          <div className="container max-w-full px-4 py-6 overflow-x-auto">
            <Board
              boardId={board.id}
              initialColumns={columns}
              initialCards={cards}
            />
          </div>
        )}
      </div>

      <PasswordModal
        shareCode={shareCode}
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
}
