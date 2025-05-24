export interface CalendarEvent {
  id: number;
  name: string | null;
  emoji: string | null;
  slug: string | null;
  description: string | null;
  start_at: Date | null;
  end_at: Date | null;
  created_at: Date;
}
