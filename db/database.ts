import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import ws from "ws";
import { CalendarEvent } from "./types/calendar-event";

interface Database {
  events: CalendarEvent;
}

let database: Kysely<Database> | undefined;

export const dialect = new NeonDialect({
  connectionString: import.meta.env.VITE_DATABASE_URL,
  webSocketConstructor: ws,
});

export const getDatabase = () => {
  if (database) return database;

  database = new Kysely<Database>({
    dialect,
  });

  return database;
};
