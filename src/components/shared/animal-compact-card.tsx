"use client";

import { iconDelete, iconEdit } from "@/lib/icons";
import { iconEmptyAnimals } from "@/lib/icons";
import { AttachmentImage } from "@/components/shared/attachment-image";
import { cn } from "@/lib/utils";
import type { AnimalListItem } from "@/components/features/animal-edit-dialog";

type AnimalCompactCardProps = {
  row: AnimalListItem;
  showActions?: boolean;
  busy?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel: string;
  deleteLabel: string;
  className?: string;
};

export function AnimalCompactCard({
  row,
  showActions,
  busy,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  className,
}: AnimalCompactCardProps) {
  const AnimalIcon = iconEmptyAnimals;
  const EditIcon = iconEdit;
  const DeleteIcon = iconDelete;

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-border/50 bg-card p-3 shadow-card max-md:rounded-3xl",
        className,
      )}
    >
      <div className="mb-2 flex justify-center">
        {row.photoUrl ? (
          <div className="size-14 overflow-hidden rounded-2xl border border-border/50">
            <AttachmentImage
              streamUrl={row.photoUrl}
              alt={row.numeroTag}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <span
            className="flex size-14 items-center justify-center rounded-2xl bg-zone-rust/14 text-zone-rust"
            aria-hidden
          >
            <AnimalIcon className="text-3xl" />
          </span>
        )}
      </div>
      <p className="truncate text-center text-sm font-bold">{row.numeroTag}</p>
      <p className="truncate text-center text-xs text-muted-foreground">{row.espece}</p>
      <p className="mt-1 text-center text-sm font-semibold tabular-nums">
        {row.poidsVifKg.toLocaleString("fr-FR")} kg
      </p>
      {showActions && onEdit && onDelete ? (
        <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-border/60 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            className="flex min-h-9 items-center justify-center gap-1 rounded-xl bg-primary/10 text-xs font-semibold text-primary disabled:opacity-50"
            aria-label={editLabel}
          >
            <EditIcon className="shrink-0 text-base" aria-hidden />
            {editLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="flex min-h-9 items-center justify-center gap-1 rounded-xl bg-destructive/10 text-xs font-semibold text-destructive disabled:opacity-50"
            aria-label={deleteLabel}
          >
            <DeleteIcon className="shrink-0 text-base" aria-hidden />
            {deleteLabel}
          </button>
        </div>
      ) : null}
    </article>
  );
}
