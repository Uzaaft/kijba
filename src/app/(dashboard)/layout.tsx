import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background justify-center flex flex-row">
        {children}
      </div>
      <Toaster />
    </>
  );
}
