"use client";

import { useEffect, useState } from "react";
import { fetchAttachmentBlob } from "@/lib/api/services/attachments";
import { isApiEnabled } from "@/lib/api/config";
import { cn } from "@/lib/utils";

type Props = {
  streamUrl: string;
  alt: string;
  className?: string;
};

export function AttachmentImage({ streamUrl, alt, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiEnabled() || !streamUrl) {
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
      } catch {
        if (!cancelled) {
          setSrc(null);
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

  if (!src) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("object-cover", className)} />
  );
}
