/** Shared TypeScript types mirroring backend schemas. */
export type Role = "admin" | "practitioner" | "public";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: Role;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  room_type: "therapy" | "consultation" | "meeting";
  capacity: number;
  hourly_rate: number;
  amenities: string[];
  images: string[];
  status: "active" | "maintenance" | "archived";
}

export interface Booking {
  id: string;
  room_id: string;
  practitioner_id: string;
  booking_date: string;     // YYYY-MM-DD
  start_time: string;        // HH:MM
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  total_amount: number;
  notes?: string | null;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  category_id?: string | null;
  tags: string[];
  published: boolean;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at?: string;
}
