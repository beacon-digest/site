import { Button, Group, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import {
  createEventAdmin,
  updateEventAdmin,
} from "../../server/events/admin";

const TIME_ZONE = "America/New_York";

type LocationOption = { id: number; name: string | null };

export type EventFormInitial = {
  id: number;
  name: string | null;
  emoji: string | null;
  slug: string | null;
  description: string | null;
  url: string | null;
  location_id: number | null;
  start_at: Date | string | null;
  end_at: Date | string | null;
};

function toLocalInput(value: Date | string | null): string {
  if (!value) return "";
  return formatInTimeZone(new Date(value), TIME_ZONE, "yyyy-MM-dd'T'HH:mm");
}

export function EventForm({
  mode,
  initial,
  locations,
}: {
  mode: "create" | "edit";
  initial?: EventFormInitial;
  locations: LocationOption[];
}) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [locationId, setLocationId] = useState<string | null>(
    initial?.location_id ? String(initial.location_id) : null,
  );
  const [startAt, setStartAt] = useState(toLocalInput(initial?.start_at ?? null));
  const [endAt, setEndAt] = useState(toLocalInput(initial?.end_at ?? null));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name,
        emoji: emoji || null,
        slug: slug || null,
        description: description || null,
        url: url || null,
        location_id: locationId ? Number(locationId) : null,
        start_at: startAt,
        end_at: endAt || null,
      };
      if (mode === "create") {
        await createEventAdmin({ data: payload });
      } else if (initial) {
        await updateEventAdmin({ data: { ...payload, id: initial.id } });
      }
      await navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" maw={640}>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <TextInput
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <TextInput
          label="Emoji"
          maxLength={8}
          value={emoji}
          onChange={(e) => setEmoji(e.currentTarget.value)}
        />
        <TextInput
          label="Slug"
          description="Leave blank to generate from the name"
          value={slug}
          onChange={(e) => setSlug(e.currentTarget.value)}
        />
        <Textarea
          label="Description"
          autosize
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <TextInput
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
        />
        <Select
          label="Location"
          placeholder="No location"
          clearable
          searchable
          data={locations.map((l) => ({
            value: String(l.id),
            label: l.name ?? `Location ${l.id}`,
          }))}
          value={locationId}
          onChange={setLocationId}
        />
        <TextInput
          label="Starts at"
          type="datetime-local"
          required
          value={startAt}
          onChange={(e) => setStartAt(e.currentTarget.value)}
        />
        <TextInput
          label="Ends at"
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.currentTarget.value)}
        />
        <Group>
          <Button type="submit" loading={submitting}>
            {mode === "create" ? "Create event" : "Save changes"}
          </Button>
          <Button
            variant="default"
            type="button"
            onClick={() => navigate({ to: "/admin" })}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
