export const formatEventTime = (
  startAt: Date | null,
  endAt: Date | null,
): string => {
  if (!startAt) return "Time TBD";

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const startTime = startAt.toLocaleTimeString("en-US", formatOptions);
  const endTime = endAt?.toLocaleTimeString("en-US", formatOptions);

  return endTime ? `${startTime} - ${endTime}` : startTime;
};
