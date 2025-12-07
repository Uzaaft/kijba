"use client";

import { useState, useEffect } from "react";
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

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: {
    id: string;
    content: string;
    color: string;
  };
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

export function EditCardDialog({
  open,
  onOpenChange,
  card,
  onSubmit,
}: EditCardDialogProps) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && card) {
      setContent(card.content);
      setColor(card.color);
    }
  }, [open, card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(content.trim(), color);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update your card content and color
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
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
