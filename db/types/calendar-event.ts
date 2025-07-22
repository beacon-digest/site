export interface CalendarEvent {
  id: number;
  name: string | null;
  emoji: string | null;
  slug: string | null;
  description: string | null;
  external_id: string | null;
  start_at: Date | null;
  end_at: Date | null;
  location: CalendarEventLocation | null;
  created_at: Date;
}

export interface CalendarEventLocation {
  id: number;
  name: string | null;
  address: string | null;
}
