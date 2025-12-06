"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";

interface Board {
  id: string;
  name: string;
  shareCode: string;
  createdAt: string;
  passwordHash?: string;
}

export default function BoardSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  useEffect(() => {
    const loadBoard = async () => {
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
        router.push("/boards");
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId, router]);

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
    if (!confirm("Generate a new share code and password? The old ones will no longer work.")) {
      return;
    }

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
        error instanceof Error ? error.message : "Failed to regenerate share code"
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm("Are you sure you want to delete this board? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete board");
      toast.success("Board deleted");
      router.push("/boards");
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

  if (loading) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Loading board settings...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Board Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Board Name */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Board Name</h2>
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
            <Button type="submit" disabled={updating || name === board.name}>
              {updating ? "Updating..." : "Update"}
            </Button>
          </form>
        </Card>

        {/* Share Link */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Share Link</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Code</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded border break-all">
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
        </Card>

        {/* Security */}
        <Card className={`p-6 ${showNewPassword ? "border-green-200 bg-green-50" : ""}`}>
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Regenerate the share code and password to invalidate existing access links.
            This is useful if you need to rotate your board's access credentials.
          </p>
          
          {showNewPassword && newPassword && (
            <div className="mb-4 p-3 bg-white border border-green-200 rounded">
              <p className="text-sm font-medium mb-2">New Password Generated:</p>
              <code className="block bg-muted px-2 py-1 rounded font-mono text-sm break-all mb-2">
                {newPassword}
              </code>
              <p className="text-xs text-green-700">
                Save this password - collaborators will need it to access your board
              </p>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={handleRegenerateShareCode}
            disabled={regenerating}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {regenerating ? "Regenerating..." : "Regenerate Share Code & Password"}
          </Button>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <p className="text-sm text-red-600 mb-4">
            Deleting a board is permanent and cannot be undone. All columns and
            cards will be deleted.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteBoard}
            className="w-full"
          >
            Delete Board
          </Button>
        </Card>
      </div>
    </div>
  );
}
