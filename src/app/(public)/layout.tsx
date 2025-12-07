import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collaborative Board | Kan I Just Ban Already",
  description: "Join a collaborative Kanban board and work together in real-time.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
