import { formatInTimeZone } from "date-fns-tz";

export const formatEventTime = (
  startAt: Date | null,
  endAt: Date | null,
): string => {
  if (!startAt) return "Time TBD";

  const TIME_ZONE = "America/New_York";
  const timeFormat = "h:mm a"; // e.g., "5:30 PM"

  // formatInTimeZone treats the Date object as UTC and converts to the target timezone
  // Date objects from the database should already be UTC, but this ensures correct handling
  const startTime = formatInTimeZone(startAt, TIME_ZONE, timeFormat);
  const endTime = endAt ? formatInTimeZone(endAt, TIME_ZONE, timeFormat) : null;

  return endTime ? `${startTime} - ${endTime}` : startTime;
};
