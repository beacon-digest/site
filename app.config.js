import { defineConfig } from "@tanstack/react-start/config";
import tailwindCss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
export default defineConfig({
    vite: {
        plugins: [
            tsConfigPaths({
                projects: ["./tsconfig.json"],
            }),
            tailwindCss(),
        ],
    },
});
