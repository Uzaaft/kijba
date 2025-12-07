"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Board {
  id: string;
  name: string;
  shareCode: string;
  createdAt: string;
}

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardCreated?: (board: Board) => void;
}

export function CreateBoardDialog({
  open,
  onOpenChange,
  onBoardCreated,
}: CreateBoardDialogProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Board name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          password: password || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create board");
      }

      const board = await response.json();

      toast.success("Board created successfully!");

      if (board.generatedPassword) {
        toast.info(`Password: ${board.generatedPassword}`, {
          description: "Save this password to access your board later",
        });
      }

      setName("");
      setPassword("");
      onOpenChange(false);
      onBoardCreated?.(board);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create board"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new Kanban board to collaborate with your team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              placeholder="e.g., Sprint Planning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-password">
              Password{" "}
              <span className="text-xs text-muted-foreground">
                (optional, auto-generated if empty)
              </span>
            </Label>
            <Input
              id="board-password"
              type="password"
              placeholder="Leave empty for auto-generated"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
