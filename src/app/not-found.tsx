import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold text-primary mb-2">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold">Page not found</h2>
        </div>

        <p className="text-lg text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist. Check the
          URL or head back home.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/boards">My Boards</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
