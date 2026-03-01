import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

export const getLocation = createServerFn()
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const database = getDatabase();

    const location = await database
      .selectFrom("locations")
      .select(["locations.id", "locations.name", "locations.address"])
      .where("locations.id", "=", id)
      .executeTakeFirst();

    if (!location) throw new Error("Location not found");

    return location;
  });
