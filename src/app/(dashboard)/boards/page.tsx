"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { BoardCard } from "@/components/board/board-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

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
    setDeletingBoardId(boardId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteBoard = async () => {
    if (!deletingBoardId) return;

    try {
      const response = await fetch(`/api/boards/${deletingBoardId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete board");
      setBoards(boards.filter((b) => b.id !== deletingBoardId));
      toast.success("Board deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete board"
      );
    } finally {
      setDeletingBoardId(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleBoardCreated = (newBoard: Board) => {
    setBoards([newBoard, ...boards]);
    loadBoards();
  };

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Boards</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your Kanban boards
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New Board
        </Button>
      </div>

      <CreateBoardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onBoardCreated={handleBoardCreated}
      />

      {loading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading boards...</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              No boards yet. Create your first board to get started!
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              Create Your First Board
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              {...board}
              onDelete={handleDeleteBoard}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Board?"
        description="This board and all its contents will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteBoard}
      />
    </div>
  );
}
