"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCommunityPost,
  uploadPostImage,
  updateCommunityPostImage,
  isCommunityStorageReady,
} from "@/lib/supabase/community-actions";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function CreatePostForm({ storageReady }: { storageReady: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [destination, setDestination] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const result = await createCommunityPost({
      title,
      body,
      destination: destination || undefined,
    });

    if (!result.ok) {
      setBusy(false);
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }

    const postId = result.data.id;

    if (imageFile && storageReady) {
      const fd = new FormData();
      fd.set("file", imageFile);
      fd.set("postId", postId);
      const upload = await uploadPostImage(fd);
      if (upload.ok && upload.data.url) {
        await updateCommunityPostImage(postId, upload.data.url);
      }
    }

    setBusy(false);
    setSuccess("Post submitted for review. It will appear once approved.");
    setTitle("");
    setBody("");
    setDestination("");
    setImageFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your trip headline"
          required
          maxLength={200}
        />
      </div>
      <div>
        <label className="label">Destination (optional)</label>
        <input
          className="input"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Maldives, Dubai, Tokyo"
          maxLength={120}
        />
      </div>
      <div>
        <label className="label">Story</label>
        <textarea
          className="input min-h-32"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share tips, photos context, or travel advice…"
          required
          maxLength={8000}
        />
      </div>
      {storageReady && (
        <div>
          <label className="label">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-charcoal/45">Max 5 MB. JPG, PNG, or WebP.</p>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700 font-semibold">{success}</p>}
      <button type="submit" disabled={busy} className="btn-gold px-6 py-2.5 text-sm disabled:opacity-60">
        {busy ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs text-charcoal/45">All posts are moderated before appearing on the public feed.</p>
    </form>
  );
}
