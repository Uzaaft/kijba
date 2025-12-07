"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface CardProps {
  id: string;
  content: string;
  color: string;
  position: number;
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

export function Card({
  id,
  content,
  color,
  position,
  onEdit,
  onDelete,
}: CardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Draggable draggableId={id} index={position}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 rounded-lg mb-2 cursor-move transition-all ${snapshot.isDragging ? "shadow-lg" : "shadow-sm"
            }`}
          style={{
            backgroundColor: color,
            ...provided.draggableProps.style,
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm flex-1 text-background pr-1">
              <MarkdownRenderer content={content} />
            </div>
            {isHovering && (
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  className="h-5 w-5 p-0 bg-primary hover:bg-primary/80 text-primary-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(id);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  className="h-5 w-5 p-0 bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
