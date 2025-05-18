import { ActionIcon, Group, Paper, Text, rem } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

interface DayNavbarProps {
  selectedDate: string | undefined;
}

export const DayNavbar: React.FC<DayNavbarProps> = ({ selectedDate }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const baseDate = startOfWeek(addDays(new Date(), weekOffset * 7));
  const daysToDisplay = 7;

  const dateLinks = Array.from({ length: daysToDisplay }, (_, i) => {
    const date = addDays(baseDate, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const path = isToday(date) ? "/" : `/${formattedDate}`;

    // If we're at root (/), use isToday logic
    // Otherwise, compare with the URL date parameter
    const isCurrentDay = !date ? isToday(date) : formattedDate === selectedDate;

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
