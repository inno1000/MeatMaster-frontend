import { Noto_Sans_Arabic, Poppins } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const fontBodyClassName = `${poppins.variable} ${notoSansArabic.variable} tap-highlight-transparent font-sans antialiased`;
