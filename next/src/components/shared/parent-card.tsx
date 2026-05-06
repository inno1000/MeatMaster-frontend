import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ParentCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const ParentCard = ({ title, subtitle, children }: ParentCardProps) => {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="break-words text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
