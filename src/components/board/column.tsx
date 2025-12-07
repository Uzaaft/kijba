"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "./card";

interface CardData {
  id: string;
  columnId: string;
  content: string;
  position: number;
  color: string;
}

interface ColumnProps {
  id: string;
  name: string;
  cards: CardData[];
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function Column({
  id,
  name,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDeleteColumn,
}: ColumnProps) {
  const [isHovering, setIsHovering] = useState(false);

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div
      className="bg-card rounded-lg p-4 min-w-80 max-w-80 h-full flex flex-col border border-border"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground">
          {name}
        </h3>
        {isHovering && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDeleteColumn(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Droppable droppableId={id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto rounded-lg transition-colors ${snapshot.isDraggingOver ? "bg-accent/10" : ""
              }`}
            style={{ minHeight: "200px" }}
          >
            {sortedCards.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">
                No cards yet
              </p>
            )}
            {sortedCards.map((card) => (
              <Card
                key={card.id}
                id={card.id}
                content={card.content}
                color={card.color}
                position={sortedCards.indexOf(card)}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={() => onAddCard(id)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Card
      </Button>
    </div>
  );
}
