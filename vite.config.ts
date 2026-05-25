import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import * as dotenv from "dotenv";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Load server-side env (e.g. WORKOS_*, VITE_DATABASE_URL) into process.env for
// local dev. On Netlify these are provided by the host environment.
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "app",
    }),
    nitroV2Plugin({ compatibilityDate: "2026-05-25" }),
    viteReact(),
  ],
});
