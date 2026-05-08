"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Info, Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const MAX_RECORDINGS = 3;
const MAX_SECONDS = 60;

type RecordingItem = { url: string; blob: Blob };

export function AudioRecorder({ className }: { className?: string }) {
  const t = useTranslations("audioRecorder");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingsRef = useRef<RecordingItem[]>([]);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTimer = clearTimer;

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      if (!isRecordingRef.current) {
        return;
      }
      setElapsedSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_SECONDS) {
          queueMicrotask(() => {
            if (isRecordingRef.current) {
              stopTimer();
              setElapsedSeconds(0);
              const mr = mediaRecorderRef.current;
              if (mr && mr.state !== "inactive") {
                mr.stop();
              }
              setIsRecording(false);
              setIsPaused(false);
            }
          });
          return MAX_SECONDS;
        }
        return next;
      });
    }, 1000);
  }, [clearTimer, stopTimer]);

  const stopRecording = useCallback(() => {
    stopTimer();
    setElapsedSeconds(0);
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  }, [stopTimer]);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : undefined;

      const mediaRecorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const chunks = audioChunksRef.current;
        const blob = new Blob(chunks, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setRecordings((prev) => [...prev, { url, blob }]);
        }
        audioChunksRef.current = [];
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
      };

      mediaRecorder.start();
      setElapsedSeconds(0);
      startTimer();
      setIsRecording(true);
      setIsPaused(false);
    } catch {
      setMicError(t("micDenied"));
    }
  };

  const pauseRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") {
      mr.pause();
      stopTimer();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "paused") {
      mr.resume();
      startTimer();
      setIsPaused(false);
    }
  };

  const toggleRecording = () => {
    if (recordings.length >= MAX_RECORDINGS) {
      return;
    }
    if (!isRecording) {
      void startRecording();
    } else if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const deleteRecording = (index: number) => {
    setRecordings((prev) => {
      const item = prev[index];
      if (item) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      clearTimer();
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recordingsRef.current.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [clearTimer]);

  const formattedTime = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const recordDisabled = recordings.length >= MAX_RECORDINGS;
  const ToggleIcon = !isRecording ? Mic : isPaused ? Play : Pause;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Mic className="size-6 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base sm:text-lg">{t("title")}</CardTitle>
            <CardDescription>
              {t("count", { current: recordings.length, max: MAX_RECORDINGS })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {micError ? (
          <p className="text-sm text-destructive" role="alert">
            {micError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            size="icon"
            disabled={recordDisabled}
            className="size-[72px] shrink-0 rounded-full shadow-md"
            variant={isRecording && !isPaused ? "secondary" : "primary"}
            onClick={() => toggleRecording()}
            aria-label={t("ariaRecord")}
          >
            <ToggleIcon className="size-8" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="size-[72px] shrink-0 rounded-full shadow-md"
            disabled={!isRecording}
            onClick={() => stopRecording()}
            aria-label={t("ariaStop")}
          >
            <Square className="size-7 fill-current" />
          </Button>
        </div>

        {isRecording || elapsedSeconds > 0 ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-3 text-center text-sm font-semibold sm:text-base",
              isRecording && !isPaused
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                : "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100",
            )}
          >
            {isRecording && !isPaused ? t("recording") : t("paused")} :{" "}
            {formattedTime}
          </div>
        ) : null}

        {recordings.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold">{t("recordingsTitle")}</p>
            <ul className="space-y-3">
              {recordings.map((rec, index) => (
                <li
                  key={rec.url}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center"
                >
                  <audio
                    src={rec.url}
                    controls
                    className="min-h-11 w-full flex-1 rounded-md"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => deleteRecording(index)}
                    aria-label={t("delete")}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {recordings.length === 0 && !isRecording ? (
          <Alert className="flex gap-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <AlertDescription>{t("hint")}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
