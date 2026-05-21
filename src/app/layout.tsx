import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Noto_Sans_Arabic, Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
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
    <html suppressHydrationWarning lang="fr">
      <body
        className={`${poppins.variable} ${notoSansArabic.variable} tap-highlight-transparent font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
