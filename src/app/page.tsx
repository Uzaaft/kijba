import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Kan I Just Ban Already?
          </h1>

          <p className="text-xl text-muted-foreground">
            Frictionless collaborative Kanban boards. No accounts needed for
            team members—just a link and a password.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>

          <div className="pt-8 space-y-6 text-left">
            <h2 className="text-2xl font-bold text-center">Why use KIJBA?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">No Sign-ups</h3>
                <p className="text-sm text-muted-foreground">
                  Share a link and password. Team members join instantly,
                  no registration needed.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">
                  See changes instantly as team members collaborate on the
                  board.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Lightweight</h3>
                <p className="text-sm text-muted-foreground">
                  Clean, minimal interface. Drag and drop cards effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
