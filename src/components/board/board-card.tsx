"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface BoardCardProps {
  id: string;
  name: string;
  shareCode: string;
  createdAt: string;
  onDelete?: (id: string) => void;
}

export function BoardCard({
  id,
  name,
  shareCode,
  createdAt,
  onDelete,
}: BoardCardProps) {
  const boardUrl = `/b/${shareCode}`;
  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/boards/${id}`}
            className="block mb-2 hover:underline"
          >
            <h3 className="font-semibold text-lg truncate">{name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-2">
            Created {formattedDate}
          </p>
          <p className="text-xs text-muted-foreground break-all">
            Share Code: <code className="bg-muted px-1 py-0.5 rounded">{shareCode}</code>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/boards/${id}`}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/b/${shareCode}`
                );
              }}
            >
              Copy Share Link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
