"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Zap,
  Lock,
  ArrowRight,
  Check,
  Share2,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");

  const handleJoinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareCode.trim()) {
      router.push(`/b/${encodeURIComponent(shareCode.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>📋</span>
            <span className="hidden sm:inline">KIJBA</span>
          </div>
          {!session && (
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-48">
          <div className="max-w-3xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Collaborate Instantly
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Frictionless Kanban boards. No accounts needed for team
                members—just a link and a password.
              </p>
            </div>

            {/* CTA Buttons */}
            {session ? (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/boards" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/sign-up" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              No credit card required. Start collaborating in seconds.
            </p>
          </div>
        </div>

        {/* Join Board Section */}
        {!session && (
          <div className="py-16 border-y">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Already have a share code?</h2>
                <p className="text-muted-foreground">
                  Enter it below to join a board instantly.
                </p>
              </div>

              <form onSubmit={handleJoinBoard} className="flex gap-2">
                <Input
                  placeholder="Enter share code..."
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="lg" variant="default">
                  Join
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="py-20 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why use KIJBA?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for seamless team collaboration, without the
              complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="space-y-4 p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Share Instantly</h3>
              <p className="text-muted-foreground">
                Share a link and password. Team members join instantly, no
                registration needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Sync</h3>
              <p className="text-muted-foreground">
                See changes instantly as team members collaborate on the board.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Password Protected</h3>
              <p className="text-muted-foreground">
                Control access with secure passwords. Keep your ideas private.
              </p>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Simple & Lightweight</h3>
              <ul className="space-y-3">
                {[
                  "Drag and drop cards effortlessly",
                  "Unlimited columns and cards",
                  "No learning curve",
                  "Works on any device",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Built for Teams</h3>
              <ul className="space-y-3">
                {[
                  "Real-time collaboration",
                  "No accounts required for guests",
                  "Perfect for brainstorms",
                  "Manage multiple boards",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t py-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to collaborate?</h2>
            <p className="text-lg text-muted-foreground">
              Create your first board and start working with your team right
              now.
            </p>
            {!session && (
              <Button asChild size="lg">
                <Link href="/sign-up" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
