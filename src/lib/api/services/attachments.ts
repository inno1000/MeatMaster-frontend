import { ApiError, parseJson } from "@/lib/api/client";
import { isApiEnabled } from "@/lib/api/config";
import { v1Url } from "@/lib/api/v1-url";
import { unwrapDataObject } from "@/lib/api/unwrap";
import { useAuthStore } from "@/lib/stores/auth-store";

export type AttachmentDto = {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  stream_url: string;
};

const buildAuthHeaders = (): Headers => {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const token = useAuthStore.getState().user?.token as string | undefined;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export async function uploadAttachment(
  blob: Blob,
  index: number,
): Promise<string> {
  if (!isApiEnabled()) {
    throw new ApiError("API non configurée", 0);
  }

  const ext = blob.type.includes("ogg") ? "ogg" : "webm";
  const form = new FormData();
  form.append("file", blob, `recording-${index + 1}.${ext}`);

  const response = await fetch(v1Url("/attachments"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: form,
  });

  const json = await parseJson<unknown>(response);
  const data = unwrapDataObject(json);

  return String(data.id ?? "");
}

export async function uploadAudioBlobs(blobs: Blob[]): Promise<string[]> {
  if (!isApiEnabled() || blobs.length === 0) {
    return [];
  }

  const ids: string[] = [];
  for (let i = 0; i < blobs.length; i++) {
    const id = await uploadAttachment(blobs[i], i);
    if (id) {
      ids.push(id);
    }
  }
  return ids;
}

export async function fetchAttachmentBlob(streamUrl: string): Promise<Blob> {
  const response = await fetch(streamUrl, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }
  return response.blob();
}
