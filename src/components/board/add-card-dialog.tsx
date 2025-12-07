"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string, color: string) => void;
}

const COLORS = [
  { value: "#d4a574", label: "Tan" },
  { value: "#d65c5c", label: "Red" },
  { value: "#83c5a5", label: "Teal" },
  { value: "#9fc087", label: "Green" },
  { value: "#d896b8", label: "Purple" },
  { value: "#d9994a", label: "Orange" },
  { value: "#e8b565", label: "Gold" },
];

export function AddCardDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddCardDialogProps) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(content.trim(), color);
      setContent("");
      setColor(COLORS[0].value);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setContent("");
      setColor(COLORS[0].value);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Card</DialogTitle>
          <DialogDescription>
            Create a new card in this column
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-content">Card Content</Label>
            <textarea
              id="card-content"
              placeholder="Enter your card content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Card Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-all ${color === c.value ? "border-foreground" : "border-border"
                    }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  disabled={loading}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
