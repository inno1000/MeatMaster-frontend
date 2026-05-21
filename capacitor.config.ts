import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.boucherie.meatmaster",
  appName: "MeatMaster",
  /** Sortie de `npm run build` (export statique → `out/`). */
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
