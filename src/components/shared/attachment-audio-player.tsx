"use client";

import { useEffect, useState } from "react";
import { fetchAttachmentBlob } from "@/lib/api/services/attachments";
import { isApiEnabled } from "@/lib/api/config";

type Props = {
  streamUrl: string;
  label?: string;
};

export function AttachmentAudioPlayer({ streamUrl, label }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isApiEnabled()) {
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const blob = await fetchAttachmentBlob(streamUrl);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setError(false);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [streamUrl]);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        {label ? `${label} — ` : ""}
        Lecture impossible
      </p>
    );
  }

  if (!src) {
    return (
      <p className="text-sm text-muted-foreground">
        {label ?? "Chargement…"}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {label ? (
        <p className="text-xs text-muted-foreground">{label}</p>
      ) : null}
      <audio src={src} controls className="min-h-11 w-full rounded-md" />
    </div>
  );
}
