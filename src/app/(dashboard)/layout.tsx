import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-background justify-center flex flex-row">
        {children}
      </div>
      <Toaster />
    </>
  );
}
