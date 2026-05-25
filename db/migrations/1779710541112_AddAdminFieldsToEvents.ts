import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("events")
    // WorkOS organization id of the owning business. NULL = platform/staff-owned
    // (includes Notion-synced events).
    .addColumn("organization_id", "text")
    // Moderation state: 'published' | 'pending' | 'rejected'. Default keeps all
    // existing and Notion-synced events visible on the public site.
    .addColumn("status", "text", (col) =>
      col.notNull().defaultTo(sql.lit("published")),
    )
    // When true, the Notion sync must not overwrite or delete this event.
    .addColumn("admin_locked", "boolean", (col) =>
      col.notNull().defaultTo(sql.lit(false)),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("events")
    .dropColumn("organization_id")
    .dropColumn("status")
    .dropColumn("admin_locked")
    .execute();
}
