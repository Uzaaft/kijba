"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Copy, RefreshCw } from "lucide-react";

interface Board {
  id: string;
  name: string;
  shareCode: string;
  createdAt: string;
  passwordHash?: string;
}

interface BoardSettingsModalProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardDeleted?: () => void;
}

export function BoardSettingsModal({
  boardId,
  open,
  onOpenChange,
  onBoardDeleted,
}: BoardSettingsModalProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadBoard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/boards/${boardId}`);
        if (!response.ok) throw new Error("Failed to load board");
        const data = await response.json();
        setBoard(data);
        setName(data.name);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load board"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId, open]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update board");
      const updated = await response.json();
      setBoard(updated);
      toast.success("Board name updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update board"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRegenerateShareCode = async () => {
    setRegenerating(true);
    setShowNewPassword(false);
    setNewPassword(null);

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regeneratePassword: true }),
      });

      if (!response.ok) throw new Error("Failed to regenerate share code");
      const updated = await response.json();
      setBoard(updated);
      setNewPassword(updated.generatedPassword);
      setShowNewPassword(true);
      toast.success("Share code and password regenerated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to regenerate share code"
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete board");
      toast.success("Board deleted");
      onOpenChange(false);
      onBoardDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete board"
      );
    }
  };

  const handleCopyShareLink = () => {
    if (board) {
      const url = `${window.location.origin}/b/${board.shareCode}`;
      navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-muted-foreground py-8">Loading board settings...</p>
        ) : !board ? (
          <p className="text-muted-foreground py-8">Board not found</p>
        ) : (
          <div className="space-y-6">
            {/* Board Name */}
            <div className="space-y-4">
              <h3 className="font-semibold">Board Name</h3>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="board-name">Name</Label>
                  <Input
                    id="board-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={updating}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updating || name === board.name}
                  className="w-full"
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
              </form>
            </div>

            {/* Share Link */}
            <div className="space-y-4">
              <h3 className="font-semibold">Share Link</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Share Code</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded border break-all text-sm">
                      {board.shareCode}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyShareLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleCopyShareLink} className="w-full">
                  Copy Full Share Link
                </Button>
              </div>
            </div>

            {/* Security */}
            <div
              className={`space-y-4 p-4 rounded border ${
                showNewPassword ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">
                Regenerate the share code and password to invalidate existing
                access links. This is useful if you need to rotate your
                board&apos;s access credentials.
              </p>

              {showNewPassword && newPassword && (
                <div className="p-3 bg-background border border-accent rounded">
                  <p className="text-sm font-medium mb-2">
                    New Password Generated:
                  </p>
                  <code className="block bg-muted px-2 py-1 rounded font-mono text-sm break-all mb-2">
                    {newPassword}
                  </code>
                  <p className="text-xs text-accent">
                    Save this password - collaborators will need it to access
                    your board
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={regenerating}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {regenerating
                  ? "Regenerating..."
                  : "Regenerate Share Code & Password"}
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4 p-4 rounded border border-destructive bg-destructive/5">
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-destructive">
                Deleting a board is permanent and cannot be undone. All columns
                and cards will be deleted.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                Delete Board
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={showRegenerateConfirm}
      onOpenChange={setShowRegenerateConfirm}
      title="Regenerate Share Code & Password?"
      description="Generate a new share code and password. The old ones will no longer work."
      confirmText="Regenerate"
      onConfirm={handleRegenerateShareCode}
    />

    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title="Delete Board?"
      description="This board and all its contents will be permanently deleted. This action cannot be undone."
      confirmText="Delete"
      variant="destructive"
      onConfirm={handleDeleteBoard}
    />
    </>
  );
}
