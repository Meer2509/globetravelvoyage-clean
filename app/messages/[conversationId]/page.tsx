import Link from "next/link";
import type { Metadata } from "next";
import { MessageThread } from "@/components/messaging/MessageThread";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth-server";
import { redirect, notFound } from "next/navigation";

type Props = { params: Promise<{ conversationId: string }> };

export const metadata: Metadata = {
  title: "Conversation — Globe Travel Voyage",
  robots: { index: false, follow: false },
};

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/messages/${conversationId}`);

  const admin = createAdminClient();
  if (!admin) notFound();

  const { data: membership } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!membership) notFound();

  const { data: conv } = await admin
    .from("conversations")
    .select("subject")
    .eq("id", conversationId)
    .maybeSingle();

  const subject = (conv as { subject: string | null } | null)?.subject ?? null;

  return (
    <>
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-4">
          <Link href="/messages" className="text-xs font-semibold text-blue hover:underline lg:hidden">
            ← Messages
          </Link>
        </div>
      </div>
      <MessageThread conversationId={conversationId} subject={subject} />
    </>
  );
}
