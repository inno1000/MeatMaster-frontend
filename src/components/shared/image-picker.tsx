"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { iconCamera, iconDelete, iconImageAdd } from "@/lib/icons";

const CameraIcon = iconCamera;
const ImageAddIcon = iconImageAdd;
const DeleteIcon = iconDelete;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 3;

type PhotoItem = {
  file: File;
  previewUrl: string;
};

type ImagePickerProps = {
  className?: string;
  label?: string;
  onFilesChange?: (files: File[]) => void;
};

export function ImagePicker({
  className,
  label,
  onFilesChange,
}: ImagePickerProps) {
  const t = useTranslations("imagePicker");
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    onFilesChange?.(photos.map((photo) => photo.file));
  }, [photos, onFilesChange]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    setPhotos((current) => {
      const remaining = MAX_PHOTOS - current.length;
      if (remaining <= 0) {
        return current;
      }

      const next = [...current];
      for (const file of Array.from(fileList).slice(0, remaining)) {
        if (!file.type.startsWith("image/")) {
          continue;
        }
        next.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
      return next;
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((_, i) => i !== index);
    });
  }, []);

  const canAddMore = photos.length < MAX_PHOTOS;
  const title = label ?? t("title");

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CameraIcon className="text-2xl text-primary" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            <CardDescription>
              {t("description", { current: photos.length, max: MAX_PHOTOS })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {photos.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2.5">
            {photos.map((photo, index) => (
              <li
                key={`${photo.file.name}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border bg-muted/30 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={photo.file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-100"
                  onClick={() => removePhoto(index)}
                  aria-label={t("removePhoto")}
                >
                  <DeleteIcon className="text-base" aria-hidden />
                  {t("removePhoto")}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {canAddMore ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 px-3 py-4 text-center transition-all hover:border-primary/60 hover:bg-primary/10 active:scale-[0.98]"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/15">
                <CameraIcon className="text-2xl text-primary" aria-hidden />
              </span>
              <span className="text-sm font-semibold leading-tight text-foreground">
                {t("takePhoto")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-border bg-card px-3 py-4 text-center transition-all hover:border-primary/40 hover:bg-muted/50 active:scale-[0.98]"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ImageAddIcon className="text-2xl text-muted-foreground" aria-hidden />
              </span>
              <span className="text-sm font-semibold leading-tight text-foreground">
                {t("chooseFromGallery")}
              </span>
            </button>
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-center text-sm text-muted-foreground">
            {t("maxReached", { max: MAX_PHOTOS })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
