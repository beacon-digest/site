import { Kysely, Generated } from "kysely";
import { NeonDialect } from "kysely-neon";
import ws from "ws";

export type EventStatus = "published" | "pending" | "rejected";

export interface EventsTable {
  id: Generated<number>;
  name: string | null;
  emoji: string | null;
  slug: string | null;
  description: string | null;
  external_id: string | null;
  url: string | null;
  location_id: number | null;
  start_at: Date | null;
  end_at: Date | null;
  created_at: Generated<Date>;
  // WorkOS organization id of the owning business; NULL = platform/staff-owned.
  organization_id: string | null;
  status: Generated<EventStatus>;
  admin_locked: Generated<boolean>;
}

export interface LocationsTable {
  id: Generated<number>;
  name: string;
  address: string | null;
  website: string | null;
  created_at: Generated<Date>;
}

export interface Database {
  events: EventsTable;
  locations: LocationsTable;
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
