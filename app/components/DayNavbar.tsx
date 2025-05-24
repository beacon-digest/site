import { ActionIcon, Group, Paper, Text, rem } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import {
  addDays,
  differenceInWeeks,
  format,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

interface DayNavbarProps {
  selectedDate: string;
}

export const DayNavbar: React.FC<DayNavbarProps> = ({ selectedDate }) => {
  // We want to calculate the initial offset based on the selected date and the current week's start date.
  // This allows us to display the selected date's week in the navbar on page load.
  const calculateInitialOffset = () => {
    if (!selectedDate) return 0;

    try {
      const selected = parseISO(selectedDate);
      const currentWeekStart = startOfWeek(new Date());
      const selectedWeekStart = startOfWeek(selected);
      return differenceInWeeks(selectedWeekStart, currentWeekStart);
    } catch {
      return 0;
    }
  };

  const [weekOffset, setWeekOffset] = useState(calculateInitialOffset);
  const baseDate = startOfWeek(addDays(new Date(), weekOffset * 7));
  const daysToDisplay = 7;

  const dateLinks = Array.from({ length: daysToDisplay }, (_, i) => {
    const date = addDays(baseDate, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const path = isToday(date) ? "/" : `/${formattedDate}`;

    const isCurrentDay = formattedDate === selectedDate;

    return (
      <Link key={i} to={path} style={{ textDecoration: "none" }}>
        <Paper
          p="xs"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isCurrentDay ? "#e9ecef" : "white",
            minWidth: rem(100),
            cursor: "pointer",
          }}
        >
          <h2 className="text-center text-3xl mb-1 font-extrabold">
            {format(date, "EEE")}
          </h2>

          <span className="text-neutral-500 text-xl">
            {format(date, "MMM d")}
          </span>
        </Paper>
      </Link>
    );
  });

  return (
    <Group justify="space-between" className="py-8">
      <ActionIcon
        variant="subtle"
        onClick={() => setWeekOffset((prev) => prev - 1)}
        size="lg"
      >
        <IconChevronLeft />
      </ActionIcon>

      {dateLinks}

      <ActionIcon
        variant="subtle"
        onClick={() => setWeekOffset((prev) => prev + 1)}
        size="lg"
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
};
