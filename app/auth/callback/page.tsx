"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { completeAuthCallback } from "@/lib/supabase/auth-callback";

function LoadingState() {
  return (
    <div className="text-center animate-fade-up">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue/10">
        <svg className="h-10 w-10 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-navy">Signing you in…</h1>
      <p className="mt-3 text-sm text-charcoal/60 leading-relaxed max-w-sm mx-auto">
        Confirming your account and preparing your dashboard. This only takes a moment.
      </p>
      <div className="mt-6 flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-blue/40 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  code,
}: {
  message: string;
  code?: string;
}) {
  const isExpired = code === "link_expired";

  return (
    <div className="text-center animate-fade-up">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-4xl">
        {isExpired ? "⏳" : "⚠️"}
      </div>
      <h1 className="text-2xl font-extrabold text-navy">
        {isExpired ? "Link expired" : "Sign-in interrupted"}
      </h1>
      <p className="mt-3 text-sm text-charcoal/60 leading-relaxed">{message}</p>
      <div className="mt-6 space-y-2.5">
        {isExpired ? (
          <>
            <Link href="/register" className="btn-primary w-full py-3 text-sm block">
              Create account again
            </Link>
            <Link href="/forgot-password" className="btn-outline w-full py-3 text-sm block">
              Request new password reset
            </Link>
          </>
        ) : (
          <Link href="/login" className="btn-primary w-full py-3 text-sm block">
            Back to sign in
          </Link>
        )}
        <Link href="/" className="block text-sm font-semibold text-blue hover:underline">
          Return to homepage
        </Link>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState<string | undefined>();

  useEffect(() => {
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const next = searchParams.get("next");
    const oauthError = searchParams.get("error");
    const oauthDescription = searchParams.get("error_description");

    if (oauthError || oauthDescription) {
      setPhase("error");
      setErrorCode(oauthError === "access_denied" ? "access_denied" : "auth_failed");
      setErrorMessage(
        oauthError === "access_denied"
          ? "Sign-in was cancelled. You can try again when you're ready."
          : "We couldn't complete sign-in. Please try again."
      );
      return;
    }

    if (!code) {
      setPhase("error");
      setErrorCode("link_expired");
      setErrorMessage(
        "This link is invalid or has already been used. Request a new confirmation email to continue."
      );
      return;
    }

    let cancelled = false;

    completeAuthCallback({ code, type, next }).then((result) => {
      if (cancelled) return;

      if (!result.ok) {
        setPhase("error");
        setErrorMessage(result.error);
        setErrorCode(result.code);
        return;
      }

      router.replace(result.redirectTo);
      router.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (phase === "error") {
    return <ErrorState message={errorMessage} code={errorCode} />;
  }

  return <LoadingState />;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex items-center justify-between border-b border-soft-200 px-5 py-4">
        <Link href="/" aria-label="Globe Travel Voyage">
          <Image
            src="/logo.png"
            alt="Globe Travel Voyage"
            width={240}
            height={64}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
        <Link href="/login" className="text-xs font-semibold text-charcoal/50 hover:text-navy transition-colors">
          Sign in
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<LoadingState />}>
            <AuthCallbackContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
