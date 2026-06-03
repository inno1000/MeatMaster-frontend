import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { fontBodyClassName } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/logo-app-ui.png",
    apple: "/logo-app-ui.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f6f5",
};

const MATERIAL_SYMBOLS_OUTLINED =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
const MATERIAL_SYMBOLS_ROUNDED =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={MATERIAL_SYMBOLS_OUTLINED} />
        <link rel="stylesheet" href={MATERIAL_SYMBOLS_ROUNDED} />
      </head>
      <body suppressHydrationWarning className={fontBodyClassName}>
        {children}
      </body>
    </html>
  );
}
