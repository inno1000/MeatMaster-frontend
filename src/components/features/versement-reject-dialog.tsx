"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { iconClose } from "@/lib/icons";

const CloseIcon = iconClose;
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { cn } from "@/lib/utils";

export type VersementRejectSummary = {
  id: string;
  butcher?: string;
  amount?: number;
  reference?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: VersementRejectSummary | null;
  onConfirm: (motif: string, audioBlobs: Blob[]) => Promise<void>;
  loading?: boolean;
};

export function VersementRejectDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  loading = false,
}: Props) {
  const t = useTranslations("versement");
  const tCommon = useTranslations("common");
  const [motif, setMotif] = useState("");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);

  useEffect(() => {
    if (!open) {
      setMotif("");
      setAudioBlobs([]);
    }
  }, [open]);

  const handleConfirm = async () => {
    const trimmed = motif.trim();
    if (!trimmed && audioBlobs.length === 0) {
      toast.error(t("rejectMotifRequired"));
      return;
    }
    try {
      await onConfirm(trimmed, audioBlobs);
      onOpenChange(false);
    } catch {
      /* parent shows toast */
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            "fixed start-1/2 top-1/2 z-50 w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-card p-6 shadow-lg outline-none",
            "max-h-[min(90dvh,640px)] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Dialog.Title className="text-xl font-bold">
                {t("rejectModalTitle")}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {t("rejectModalHint")}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={tCommon("cancel")}
              >
                <CloseIcon className="text-xl" />
              </Button>
            </Dialog.Close>
          </div>

          {summary ? (
            <div className="mb-4 rounded-xl bg-muted/40 p-3 text-center">
              {summary.amount != null ? (
                <p className="text-2xl font-bold tabular-nums">
                  {summary.amount.toLocaleString()} FCFA
                </p>
              ) : null}
              {summary.butcher ? (
                <p className="text-sm font-medium">{summary.butcher}</p>
              ) : null}
              {summary.reference ? (
                <p className="text-xs text-muted-foreground">{summary.reference}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reject-motif" className="text-sm font-medium">
                {t("rejectReasonTitle")}
              </label>
              <textarea
                id="reject-motif"
                className="min-h-[5rem] w-full rounded-xl border border-input bg-background px-3 py-3 text-base"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder={t("rejectMotifPlaceholder")}
                rows={3}
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t("rejectVoiceHint")}
              </p>
              <AudioRecorder onBlobsChange={setAudioBlobs} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                className="min-h-12 text-base"
                disabled={loading}
              >
                {tCommon("cancel")}
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant="destructive"
              className="min-h-12 text-base"
              disabled={loading}
              onClick={() => void handleConfirm()}
            >
              {t("rejectModalConfirm")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
