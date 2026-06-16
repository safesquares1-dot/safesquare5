/**
 * Local mock data so the app runs end-to-end before the backend is live.
 * Swap to real Supabase + FastAPI by setting env vars.
 */
import { slugify } from "./utils";

const now = new Date().toISOString();

export const mockApi = {
  async login({ email }: { email: string }) {
    return {
      access_token: "demo-token",
      refresh_token: "demo-refresh",
      token_type: "bearer",
      user: { id: "demo", email, full_name: "Demo User", role: "practitioner", created_at: now },
    };
  },
  async register(data: any) {
    return { access_token: "demo-token", refresh_token: "demo-refresh", token_type: "bearer", user: { id: "demo", ...data, created_at: now } };
  },
  async me() { return { id: "demo", email: "demo@safesquare.app", full_name: "Demo User", role: "practitioner", created_at: now }; },

  async listRooms(_params: any) {
    return [
      { id: "1", slug: "serenity-therapy", name: "Serenity Therapy Room", description: "Calm, sound-insulated therapy room with adjustable lighting.", room_type: "therapy", capacity: 1, hourly_rate: 35, status: "active", amenities: ["Sound insulation","Adjustable lighting","Air purifier"], images: [], created_at: now },
      { id: "2", slug: "aurora-consultation", name: "Aurora Consultation Room", description: "Bright consultation suite with dual seating and natural light.", room_type: "consultation", capacity: 2, hourly_rate: 45, status: "active", amenities: ["Desk","Whiteboard","Natural light","Wi-Fi"], images: [], created_at: now },
      { id: "3", slug: "lumina-meeting", name: "Lumina Meeting Room", description: "Spacious meeting room for group therapy or supervision.", room_type: "meeting", capacity: 8, hourly_rate: 60, status: "active", amenities: ["Projector","Video conferencing","Wi-Fi"], images: [], created_at: now },
      { id: "4", slug: "cove-therapy", name: "Cove Therapy Room", description: "Cosy therapy suite with warm tones and a private entrance.", room_type: "therapy", capacity: 1, hourly_rate: 32, status: "active", amenities: ["Warm lighting","Private entrance","Sound insulation"], images: [], created_at: now },
    ];
  },
  async getRoom(id: string) {
    const list = await this.listRooms({});
    return list.find((r: any) => r.id === id || r.slug === id);
  },

  async createBooking(data: any) {
    return { id: "b-" + Date.now(), status: "confirmed", total_amount: 35, ...data, created_at: now };
  },
  async myBookings() { return []; },
  async cancelBooking(_id: string) { return { ok: true }; },

  async listBlogs({ category, q }: { category?: string; q?: string } = {}) {
    const all = [
      { id: "1", slug: slugify("Choosing the right therapy space"), title: "Choosing the right therapy space for your practice", excerpt: "How the room you work in shapes outcomes for clients.", category_id: "c1", tags: ["therapy","practice"], published: true, published_at: now, featured_image: "", content: "# Choosing the right therapy space\n\nThe environment matters..." },
      { id: "2", slug: slugify("5 signs your practice needs a refresh"), title: "5 signs your practice needs a refresh", excerpt: "Telltale signs it's time to upgrade your consulting room.", category_id: "c6", tags: ["growth"], published: true, published_at: now, featured_image: "", content: "# 5 signs...\n\n..." },
      { id: "3", slug: slugify("The science of waiting rooms"), title: "The science of waiting rooms", excerpt: "Why ambient design calms anxious clients.", category_id: "c1", tags: ["mental-health","design"], published: true, published_at: now, featured_image: "", content: "# The science of waiting rooms\n\n..." },
    ];
    return all.filter(b => !q || b.title.toLowerCase().includes(q.toLowerCase()));
  },
  async getBlog(slug: string) {
    const list: any[] = await this.listBlogs({});
    return list.find((b) => b.slug === slug);
  },

  async submitContact(_data: any) { return { message: "Thanks — we'll be in touch shortly." }; },
  async upsertPractitioner(data: any) { return { id: "demo", user_id: "demo", verification_status: "pending", ...data }; },
};
