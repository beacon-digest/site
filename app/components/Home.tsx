import { useState, useEffect } from "react";
import type { CalendarEvent } from "../../db/types/calendar-event";
import { DayNavbar } from "./DayNavbar";
import { Event } from "../components/Event";
import { CalendarView } from "./CalendarView";
import { ViewToggle } from "./ViewToggle";
import { useLocation } from "@tanstack/react-router";
import { IconCalendarOff } from "@tabler/icons-react";

interface HomeProps {
  date: string;
  events: CalendarEvent[];
  monthEvents?: CalendarEvent[];
}

type ViewMode = "list" | "calendar";

export const Home: React.FC<HomeProps> = ({
  date,
  events,
  monthEvents = [],
}) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine view mode based on route path, but force list view on mobile
  // Only /calendar/YYYY/MM routes show calendar view, /calendar/YYYY-MM-DD shows list view
  const isMonthRoute = /^\/calendar\/\d{4}\/\d{1,2}$/.test(location.pathname);
  const routeViewMode: ViewMode = isMonthRoute ? "calendar" : "list";
  const viewMode: ViewMode = isMobile ? "list" : routeViewMode;

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
    <div className="px-4 md:px-12">
      {viewMode === "list" && <DayNavbar selectedDate={date} />}

      {/* Content area with visual separation from nav */}
      <div
        className={`${viewMode === "list" ? "border-t border-gray-300" : ""} pt-4 mt-2`}
      >
        <ViewToggle currentView={viewMode} />

        {viewMode === "calendar" ? (
          <CalendarView currentDate={date} events={monthEvents} />
        ) : (
          <div
            style={{
              opacity: fadeOut ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            {displayedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 md:py-24">
                <IconCalendarOff className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mb-4" />
                <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                  No events scheduled on this day
                </p>
                <p className="text-sm md:text-base text-gray-500">
                  Check back later
                </p>
              </div>
            ) : (
              displayedEvents.map((event, index) => (
                <Event key={event.id} event={event} isFirst={index === 0} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
