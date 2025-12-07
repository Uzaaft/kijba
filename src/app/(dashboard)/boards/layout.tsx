import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Boards | Kan I Just Ban Already",
  description: "Manage and view all your Kanban boards in one place.",
};

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
