import Link from "next/link";
import type { Metadata } from "next";
import { MessagesInbox } from "@/components/messaging/MessagesInbox";

export const metadata: Metadata = {
  title: "Messages — Globe Travel Voyage",
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return (
    <>
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Secure messaging</span>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Messages</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-dark">
            Private conversations with travelers, agents, hosts, and support.
          </p>
        </div>
      </div>
      <MessagesInbox />
    </>
  );
}
