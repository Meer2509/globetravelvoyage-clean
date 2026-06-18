import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "community-images";

export async function isCommunityStorageReady(): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin.storage.from(BUCKET).list("", { limit: 1 });
  return !error;
}

export async function uploadCommunityImage(input: {
  userId: string;
  postId: string;
  fileName: string;
  fileBytes: ArrayBuffer;
  contentType: string;
}): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Storage is not configured." };

  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_") || "image.jpg";
  const path = `${input.userId}/${input.postId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, input.fileBytes, {
    contentType: input.contentType,
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, publicUrl: data.publicUrl };
}
