import { CalendarEvent } from "../../db/types/calendar-event";
import { DayNavbar } from "./DayNavbar";
import { Event } from "../components/Event";

interface HomeProps {
  date: string;
  events: CalendarEvent[];
}

export const Home: React.FC<HomeProps> = ({ date, events }) => (
  <div className="px-12">
    <DayNavbar selectedDate={date} />

    {events.map((event) => (
      <Event
        key={event.id}
        event={event}
      />
    ))}
  </div>
);
