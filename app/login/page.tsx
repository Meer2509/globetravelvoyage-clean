import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Globe Travel Voyage account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-soft/40 px-5 py-16">
      <AuthForm mode="login" />
    </div>
  );
}
