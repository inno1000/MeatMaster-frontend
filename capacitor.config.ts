import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.boucherie.meatmaster",
  appName: "MeatMaster",
  /** Sortie de `npm run build` dans `next/` (export statique `next/out`). */
  webDir: "next/out",
  server: {
    androidScheme: "https",
  },
};

export default config;
