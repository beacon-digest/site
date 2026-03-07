import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../db/database";

export const subscribe = createServerFn()
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const trimmed = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error("Please enter a valid email address.");
    }

    const database = getDatabase();

    const result = await database
      .insertInto("subscribers")
      .values({ email: trimmed })
      .onConflict((oc) => oc.column("email").doNothing())
      .executeTakeFirst();

    const inserted =
      result.numInsertedOrUpdatedRows !== undefined &&
      result.numInsertedOrUpdatedRows > 0n;

    return {
      success: true,
      message: inserted
        ? "You're signed up! We'll be in touch."
        : "You're already signed up!",
    };
  });
