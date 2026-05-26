import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.boucherie.meatmaster",
  appName: "MeatMaster",
  /** Sortie de `npm run build` dans `next/` (export statique `next/out`). */
  webDir: "next/out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    /** Requêtes HTTP natives : évite le blocage CORS WebView (origine https://localhost). */
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
