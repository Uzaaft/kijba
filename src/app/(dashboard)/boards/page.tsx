"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { BoardCard } from "@/components/board/board-card";
import { Plus } from "lucide-react";

interface Board {
  id: string;
  name: string;
  shareCode: string;
  createdAt: string;
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadBoards = async () => {
    try {
      const response = await fetch("/api/boards");
      if (!response.ok) throw new Error("Failed to load boards");
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load boards"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete board");
      setBoards(boards.filter((b) => b.id !== boardId));
      toast.success("Board deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete board"
      );
    }
  };

  const handleBoardCreated = (newBoard: Board) => {
    setBoards([newBoard, ...boards]);
    loadBoards();
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Boards</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your Kanban boards
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Board
        </Button>
      </div>

      <CreateBoardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onBoardCreated={handleBoardCreated}
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading boards...</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No boards yet. Create your first board to get started!
          </p>
          <Button onClick={() => setDialogOpen(true)}>Create Board</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              {...board}
              onDelete={handleDeleteBoard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
