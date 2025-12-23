import { CalendarEventLocation } from "../../../../db/types/calendar-event";
import { GoogleMap } from "../../../components/GoogleMap";
import { IconMapPin, IconExternalLink } from "@tabler/icons-react";

interface EventLocationProps {
  location: CalendarEventLocation;
}

export const EventLocation = ({ location }: EventLocationProps) => {
  return (
    <div className="my-4 md:my-8">
      <div className="bg-gray-50 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-1 md:mb-2">
                {location.name}
              </h3>
              <div className="flex items-start gap-2 text-gray-600">
                <IconMapPin className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed text-sm md:text-base">
                  <p>{location.address}</p>
                  <p>Beacon, NY 12508</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center md:justify-end">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.name}, ${location.address}, Beacon, NY 12508`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-rose-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-rose-800 transition-colors text-sm md:text-base"
            >
              <IconMapPin className="w-3 h-3 md:w-4 md:h-4" />
              Open in Maps
            </a>
          </div>
        </div>

        <div className="w-full">
          <GoogleMap
            address={location.address}
            locationName={location.name}
            height={{ base: "250px", md: "350px" }}
            className="rounded-lg overflow-hidden shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
