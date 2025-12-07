import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "Sign In | Kan I Just Ban Already",
  description: "Sign in to your account to manage your Kanban boards.",
};

export default function SignInPage() {
  return <SignInForm />;
}
