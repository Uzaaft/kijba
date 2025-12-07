"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "./column";
import { AddCardDialog } from "./add-card-dialog";
import { AddColumnDialog } from "./add-column-dialog";
import { EditCardDialog } from "./edit-card-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { toast } from "sonner";

interface CardData {
  id: string;
  columnId: string;
  content: string;
  position: number;
  color: string;
}

interface ColumnData {
  id: string;
  name: string;
  position: number;
}

interface BoardProps {
  boardId: string;
  initialColumns: ColumnData[];
  initialCards: CardData[];
}

export function Board({ boardId, initialColumns, initialCards }: BoardProps) {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [cards, setCards] = useState<CardData[]>(initialCards);

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"card" | "column" | null>(null);

  const handleAddColumn = async (name: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Failed to create column");

      const newColumn = await response.json();
      setColumns([...columns, newColumn]);
      toast.success("Column created");
      setShowAddColumn(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create column");
    }
  };

  const handleAddCard = async (content: string, color: string) => {
    if (!selectedColumnId) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: selectedColumnId, content, color }),
      });

      if (!response.ok) throw new Error("Failed to create card");

      const newCard = await response.json();
      setCards([...cards, newCard]);
      toast.success("Card created");
      setShowAddCard(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create card");
    }
  };

  const handleEditCard = async (content: string, color: string) => {
    if (!selectedCardId) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${selectedCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, color }),
      });

      if (!response.ok) throw new Error("Failed to update card");

      const updated = await response.json();
      setCards(cards.map((c) => (c.id === selectedCardId ? updated : c)));
      toast.success("Card updated");
      setShowEditCard(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update card");
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCardId) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${selectedCardId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete card");

      setCards(cards.filter((c) => c.id !== selectedCardId));
      toast.success("Card deleted");
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete card");
    }
  };

  const handleDeleteColumn = async () => {
    if (!selectedColumnId) return;

    try {
      const response = await fetch(
        `/api/boards/${boardId}/columns/${selectedColumnId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete column");

      setColumns(columns.filter((c) => c.id !== selectedColumnId));
      setCards(cards.filter((c) => c.columnId !== selectedColumnId));
      toast.success("Column deleted");
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete column");
    }
  };

  const openAddCard = useCallback((columnId: string) => {
    setSelectedColumnId(columnId);
    setShowAddCard(true);
  }, []);

  const openEditCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    setShowEditCard(true);
  }, []);

  const openDeleteCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    setDeleteType("card");
    setShowDeleteConfirm(true);
  }, []);

  const openDeleteColumn = useCallback((columnId: string) => {
    setSelectedColumnId(columnId);
    setDeleteType("column");
    setShowDeleteConfirm(true);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle card drag
    if (type === "CARD") {
      const card = cards.find((c) => c.id === draggableId);
      if (!card) return;

      const newColumnId = destination.droppableId;
      const newPosition = destination.index;

      // Optimistic update
      setCards((prev) =>
        prev
          .filter((c) => c.id !== draggableId)
          .map((c) => {
            if (c.columnId === newColumnId && c.position >= newPosition) {
              return { ...c, position: c.position + 1 };
            }
            if (c.columnId === source.droppableId && c.position >= source.index) {
              return { ...c, position: c.position - 1 };
            }
            return c;
          })
          .concat({ ...card, columnId: newColumnId, position: newPosition })
      );

      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId: newColumnId,
            position: newPosition,
          }),
        });

        if (!response.ok) throw new Error("Failed to move card");
      } catch (error) {
        // Revert on error
        setCards(initialCards);
        toast.error(error instanceof Error ? error.message : "Failed to move card");
      }
    }
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <Column
                key={column.id}
                id={column.id}
                name={column.name}
                cards={cards.filter((c) => c.columnId === column.id)}
                onAddCard={openAddCard}
                onEditCard={openEditCard}
                onDeleteCard={openDeleteCard}
                onDeleteColumn={openDeleteColumn}
              />
            ))}

          <div className="shrink-0">
            <Button
              variant="outline"
              size="lg"
              className="h-fit"
              onClick={() => setShowAddColumn(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>
      </DragDropContext>

      <AddColumnDialog
        open={showAddColumn}
        onOpenChange={setShowAddColumn}
        onSubmit={handleAddColumn}
      />

      <AddCardDialog
        open={showAddCard}
        onOpenChange={setShowAddCard}
        onSubmit={handleAddCard}
      />

      {selectedCard && (
        <EditCardDialog
          open={showEditCard}
          onOpenChange={setShowEditCard}
          card={selectedCard}
          onSubmit={handleEditCard}
        />
      )}

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        type={deleteType}
        onConfirm={() => {
          if (deleteType === "card") {
            handleDeleteCard();
          } else {
            handleDeleteColumn();
          }
        }}
      />
    </div>
  );
}
