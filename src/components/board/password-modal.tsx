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

interface PasswordModalProps {
  shareCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PasswordModal({
  shareCode,
  open,
  onOpenChange,
  onSuccess,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/boards/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim(), shareCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid password");
      }

      // Store access token in session storage
      sessionStorage.setItem(`board_access_${shareCode}`, "true");

      toast.success("Access granted");
      setPassword("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Board Password</DialogTitle>
          <DialogDescription>
            This is a shared board. Please enter the password to access it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Verifying..." : "Access Board"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
