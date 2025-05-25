import { useState, useEffect } from "react";
import { CalendarEvent } from "../../db/types/calendar-event";
import { DayNavbar } from "./DayNavbar";
import { Event } from "../components/Event";

interface HomeProps {
  date: string;
  events: CalendarEvent[];
}

export const Home: React.FC<HomeProps> = ({ date, events }) => {
  const [displayedEvents, setDisplayedEvents] =
    useState<CalendarEvent[]>(events);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if events have actually changed
    const eventsChanged =
      JSON.stringify(events) !== JSON.stringify(displayedEvents);

    if (eventsChanged) {
      // Start fade out
      setFadeOut(true);

      // After fade out completes, update events and fade in
      setTimeout(() => {
        setDisplayedEvents(events);
        setFadeOut(false);
      }, 300);
    }
  }, [events, displayedEvents]);

  return (
    <div className="px-12">
      <DayNavbar selectedDate={date} />

      <div
        style={{
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {displayedEvents.map((event) => (
          <Event key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
