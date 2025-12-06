"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Github } from "lucide-react";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      await signIn.email({
        email,
        password,
      });

      toast.success("Signed in successfully");
      router.push("/boards");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/boards",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in with GitHub"
      );
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Access your Kanban boards
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGitHubSignIn}
        >
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <a
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </a>
        </div>
      </div>
    </Card>
  );
}
