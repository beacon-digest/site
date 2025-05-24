import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

export const getEvents = createServerFn().handler(async () => {
  const database = getDatabase();

  return database.selectFrom("events").selectAll().execute();
});
