import { defineConfig } from "kysely-ctl";
import ws from "ws";

import { config } from "dotenv";
import { NeonDialect } from "kysely-neon";

config({ path: ".env.local" });

const dialect = new NeonDialect({
  connectionString: process.env.VITE_DATABASE_URL,
  webSocketConstructor: ws,
});

export default defineConfig({
  dialect,
  migrations: {
    migrationFolder: "./db/migrations",
  },
});
