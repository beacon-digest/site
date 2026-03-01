import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckIcon,
  CloseButton,
  Combobox,
  Group,
  Input,
  InputBase,
  TextInput,
  useCombobox,
} from "@mantine/core";
import {
  IconSearch,
  IconCalendarOff,
  IconChevronDown,
} from "@tabler/icons-react";
import { formatInTimeZone } from "date-fns-tz";
import { searchEvents } from "../server/events/search";
import { getLocations } from "../server/locations";
import { Event } from "../components/Event";
import type { CalendarEvent } from "../../db/types/calendar-event";

const TIME_ZONE = "America/New_York";

type SearchParams = {
  q: string;
  locations: number[];
};

const loader = async ({ deps }: { deps: SearchParams }) => {
  const [events, locationsList] = await Promise.all([
    searchEvents({
      data: {
        q: deps.q || undefined,
        locationIds: deps.locations.length ? deps.locations : undefined,
      },
    }),
    getLocations(),
  ]);
  return { events, locationsList };
};

function groupEventsByDate(events: CalendarEvent[]) {
  const groups: { date: string; events: CalendarEvent[] }[] = [];
  let currentDate = "";

  for (const event of events) {
    const dateKey = event.start_at
      ? formatInTimeZone(event.start_at, TIME_ZONE, "yyyy-MM-dd")
      : "unknown";
    const dateLabel = event.start_at
      ? formatInTimeZone(event.start_at, TIME_ZONE, "EEEE, MMMM d")
      : "Date TBD";

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: dateLabel, events: [event] });
    } else {
      groups[groups.length - 1].events.push(event);
    }
  }

  return groups;
}

const SearchContainer = () => {
  const navigate = useNavigate({ from: "/search" });
  const { q, locations } = Route.useSearch();
  const { events, locationsList } = Route.useLoaderData();

  const [queryValue, setQueryValue] = useState(q);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (prev) => ({ ...prev, q: queryValue }) });
  };

  const handleLocationChange = (values: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        locations: values.map(Number),
      }),
    });
  };

  const locationOptions = locationsList.map((loc) => ({
    value: String(loc.id),
    label: loc.name ?? "Unknown location",
  }));

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const selectedLocations = locations.map(String);

  const handleLocationToggle = (val: string) => {
    const next = selectedLocations.includes(val)
      ? selectedLocations.filter((v) => v !== val)
      : [...selectedLocations, val];
    handleLocationChange(next);
  };

  const grouped = groupEventsByDate(events);

  return (
    <div className="px-4 md:px-12 py-6">
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <form onSubmit={handleQuerySubmit} className="w-full max-w-sm">
          <TextInput
            label="Search"
            value={queryValue}
            onChange={(e) => setQueryValue(e.currentTarget.value)}
            placeholder="Search events..."
            leftSection={<IconSearch size={16} />}
            autoFocus
          />
        </form>

        <Combobox
          store={combobox}
          onOptionSubmit={handleLocationToggle}
          withinPortal={false}
        >
          <Combobox.Target>
            <Input.Wrapper label="Location" className="w-full max-w-sm">
              <InputBase
                component="button"
                type="button"
                pointer
                onClick={() => combobox.toggleDropdown()}
                rightSection={
                  selectedLocations.length > 0 ? (
                    <CloseButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationChange([]);
                      }}
                    />
                  ) : (
                    <IconChevronDown size={16} />
                  )
                }
                rightSectionPointerEvents={
                  selectedLocations.length > 0 ? "all" : "none"
                }
              >
                {selectedLocations.length === 1 ? (
                  <span>
                    {locationOptions.find((o) => o.value === selectedLocations[0])?.label}
                  </span>
                ) : selectedLocations.length > 1 ? (
                  <span>{selectedLocations.length} locations selected</span>
                ) : (
                  <Input.Placeholder>All locations</Input.Placeholder>
                )}
              </InputBase>
            </Input.Wrapper>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {locationOptions.map((opt) => (
                <Combobox.Option
                  key={opt.value}
                  value={opt.value}
                  active={selectedLocations.includes(opt.value)}
                >
                  <Group gap="sm">
                    {selectedLocations.includes(opt.value) ? (
                      <CheckIcon size={12} />
                    ) : null}
                    <span>{opt.label}</span>
                  </Group>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </div>

      <div className="border-t border-gray-300 pt-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <IconCalendarOff className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mb-4" />
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              No upcoming events found
            </p>
            <p className="text-sm md:text-base text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date} className="mb-6">
              <h3 className="text-lg md:text-xl font-bold font-hepta-slab text-gray-800 mb-2">
                {group.date}
              </h3>
              {group.events.map((event, index) => (
                <Event key={event.id} event={event} isFirst={index === 0} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const rawLocations = search.locations;
    const locations = Array.isArray(rawLocations)
      ? rawLocations.map(Number).filter(Boolean)
      : rawLocations
        ? [Number(rawLocations)].filter(Boolean)
        : [];
    return {
      q: typeof search.q === "string" ? search.q : "",
      locations,
    };
  },
  loaderDeps: ({ search: { q, locations } }) => ({ q, locations }),
  loader,
  component: SearchContainer,
});
