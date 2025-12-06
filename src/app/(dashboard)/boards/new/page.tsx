"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBoardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdBoard, setCreatedBoard] = useState<any>(null);

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
      setCreatedBoard(board);
      toast.success("Board created successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create board"
      );
    } finally {
      setLoading(false);
    }
  };

  if (createdBoard) {
    return (
      <div className="container py-8">
        <Card className="p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Board Created!</h2>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Board Name</p>
              <p className="font-semibold">{createdBoard.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Share Code</p>
              <code className="block bg-muted px-2 py-1 rounded mt-1 font-mono">
                {createdBoard.shareCode}
              </code>
            </div>

            {createdBoard.generatedPassword && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Generated Password
                </p>
                <p className="font-semibold text-yellow-600">
                  {createdBoard.generatedPassword}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save this password - you'll need it to access the board later
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/boards">Back to Boards</Link>
            </Button>
            <Button
              asChild
              className="flex-1"
            >
              <Link href={`/boards/${createdBoard.id}`}>Settings</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/boards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card className="p-8 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Board</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                (optional)
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
            <p className="text-xs text-muted-foreground">
              Collaborators will need this password to access your board
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/boards")}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
