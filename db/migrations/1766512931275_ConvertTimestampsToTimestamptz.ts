import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Convert events table timestamp columns to timestamptz
  // Using raw SQL with USING clause to convert existing data
  // Treats existing naive timestamps as UTC (matching production behavior)
  await sql`
    ALTER TABLE events 
    ALTER COLUMN start_at TYPE timestamptz USING start_at AT TIME ZONE 'UTC',
    ALTER COLUMN end_at TYPE timestamptz USING end_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC'
  `.execute(db);

  // Convert locations table timestamp column to timestamptz
  await sql`
    ALTER TABLE locations 
    ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert events table timestamptz columns back to timestamp
  // Convert timestamptz to timestamp by extracting the local time components
  await sql`
    ALTER TABLE events 
    ALTER COLUMN start_at TYPE timestamp USING start_at::timestamp,
    ALTER COLUMN end_at TYPE timestamp USING end_at::timestamp,
    ALTER COLUMN created_at TYPE timestamp USING created_at::timestamp
  `.execute(db);

  // Revert locations table timestamptz column back to timestamp
  await sql`
    ALTER TABLE locations 
    ALTER COLUMN created_at TYPE timestamp USING created_at::timestamp
  `.execute(db);
}

