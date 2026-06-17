"use client";

import Link from "next/link";
import { ConversationsInbox } from "@/components/messaging/ConversationsInbox";
import { useDashboardUser } from "@/hooks/useDashboardUser";

export default function DashboardMessagesInboxPage() {
  const dashUser = useDashboardUser();

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href={`/dashboard/${dashUser.role === "customer" ? "customer" : dashUser.role === "travel_agency" ? "agency" : dashUser.role === "visa_agent" ? "agent" : dashUser.role === "tour_guide" ? "guide" : dashUser.role === "property_host" ? "host" : "customer"}`} className="text-xs font-semibold text-blue hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Messages</h1>
          <p className="mt-1 text-sm text-muted">Secure conversations with providers and specialists</p>
        </div>
      </div>
      <div className="container-px py-8">
        <ConversationsInbox />
      </div>
    </div>
  );
}
