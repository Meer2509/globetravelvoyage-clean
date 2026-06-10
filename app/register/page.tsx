import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a traveler, visa agent, travel agency or property host account on Globe Travel Voyage.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-soft/40 px-5 py-16">
      <AuthForm mode="register" />
    </div>
  );
}
