import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

export const getEvent = createServerFn()
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const database = getDatabase();

    const event = await database
      .selectFrom("events")
      .selectAll()
      .where("slug", "=", slug)
      .executeTakeFirst();

    if (!event) throw new Error("Event not found");

    return event;
  });
