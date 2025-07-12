import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("locations")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("address", "text")
    .addColumn("website", "text")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await db.schema
    .alterTable("events")
    .addColumn("location_id", "integer", (col) =>
      col.references("locations.id").onDelete("set null"),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("events").dropColumn("location_id").execute();

  await db.schema.dropTable("locations").execute();
}
