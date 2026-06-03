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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning className={fontBodyClassName}>
        {children}
      </body>
    </html>
  );
}
