import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ParentCardProps = {
  title: string;
  subtitle?: string;
  /** Icône à gauche du titre (pictogramme dans un médaillon). */
  titleIcon?: LucideIcon;
  children: ReactNode;
};

export const ParentCard = ({
  title,
  subtitle,
  titleIcon: TitleIcon,
  children,
}: ParentCardProps) => {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle
          className={cn(
            "break-words text-base font-semibold tracking-tight sm:text-lg",
            TitleIcon && "flex flex-wrap items-center gap-2 sm:gap-3",
          )}
        >
          {TitleIcon ? (
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zone-wine/22 via-zone-amber/16 to-zone-ocean/14 text-zone-wine ring-1 ring-black/[0.04] sm:size-10"
              aria-hidden
            >
              <TitleIcon className="size-[1.125rem] sm:size-5" />
            </span>
          ) : null}
          <span className="min-w-0 flex-1 leading-snug">{title}</span>
        </CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
