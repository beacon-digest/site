import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pagination, TextInput } from "@mantine/core";
import {
  IconSearch,
  IconCalendarOff,
  IconMapPin,
} from "@tabler/icons-react";
import { searchEvents } from "../../server/events/search";
import { getLocation } from "../../server/locations/show";
import { Event } from "../../components/Event";
import { GoogleMap } from "../../components/GoogleMap";
import { groupEventsByDate } from "../../utils/groupEventsByDate";
import { titleMeta } from "../../utils/meta";

const PAGE_SIZE = 25;

type LocationSearchParams = {
  q: string;
  page: number;
};

const loader = async ({
  params,
  deps,
}: {
  params: { id: string };
  deps: LocationSearchParams;
}) => {
  const locationId = Number(params.id);

  const [location, { events, total }] = await Promise.all([
    getLocation({ data: locationId }),
    searchEvents({
      data: {
        q: deps.q || undefined,
        locationIds: [locationId],
        page: deps.page - 1,
      },
    }),
  ]);

  return { location, events, total };
};

const LocationContainer = () => {
  const navigate = useNavigate({ from: "/locations/$id" });
  const { q, page } = Route.useSearch();
  const { location, events, total } = Route.useLoaderData();

  const [queryValue, setQueryValue] = useState(q);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: queryValue, page: 1 }) });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const grouped = groupEventsByDate(events);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.name}, ${location.address}, Beacon, NY 12508`)}`;

  return (
    <div className="px-4 md:px-12 py-6">
      <div className="bg-gray-50 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-hepta-slab text-gray-900 mb-1 md:mb-2">
                {location.name}
              </h1>
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
              href={mapsUrl}
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

      <div className="flex flex-wrap items-end gap-4 mb-8">
        <form onSubmit={handleQuerySubmit} className="w-full max-w-sm">
          <TextInput
            label="Search"
            value={queryValue}
            onChange={(e) => setQueryValue(e.currentTarget.value)}
            placeholder="Search events..."
            leftSection={<IconSearch size={16} />}
          />
        </form>
      </div>

      <div className="border-t border-gray-300 pt-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <IconCalendarOff className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mb-4" />
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              No upcoming events found
            </p>
            <p className="text-sm md:text-base text-gray-500">
              Try adjusting your search
            </p>
          </div>
        ) : (
          <>
            {grouped.map((group) => (
              <div key={group.date} className="mb-6">
                <h3 className="text-lg md:text-xl font-bold font-hepta-slab text-gray-800 mb-2">
                  {group.date}
                </h3>
                {group.events.map((event, index) => (
                  <Event key={event.id} event={event} isFirst={index === 0} />
                ))}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  value={page}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/locations/$id")({
  validateSearch: (search: Record<string, unknown>): LocationSearchParams => {
    const page =
      typeof search.page === "number" && search.page >= 1
        ? Math.floor(search.page)
        : 1;
    return {
      q: typeof search.q === "string" ? search.q : "",
      page,
    };
  },
  loaderDeps: ({ search: { q, page } }) => ({ q, page }),
  loader,
  component: LocationContainer,
  head: ({ loaderData }) => ({
    meta: titleMeta(loaderData?.location?.name ?? "Location"),
  }),
});
