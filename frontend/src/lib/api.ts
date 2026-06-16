/**
 * API client for the FastAPI backend.
 * Falls back to local mock data when the API is unreachable (useful for early dev / previews).
 */
import { mockApi } from "./mock";
import type { Room, Blog, Booking, User } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type FetchOpts = { token?: string; revalidate?: number; mock?: () => Promise<any> | any };

async function request<T>(path: string, init: RequestInit & FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.token) headers.Authorization = `Bearer ${init.token}`;

  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...init,
      headers,
      next: init.revalidate ? { revalidate: init.revalidate } : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, text || res.statusText);
    }
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
  } catch (err) {
    if (init.mock) return (await init.mock()) as T;
    throw err;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const api = {
  // Auth
  register: (data: any) => request<User>("/auth/register", { method: "POST", body: JSON.stringify(data), mock: () => mockApi.register(data) }),
  login: (data: any) => request<User>("/auth/login", { method: "POST", body: JSON.stringify(data), mock: () => mockApi.login(data) }),
  me: (token: string) => request<User>("/auth/me", { token, mock: () => mockApi.me() }),

  // Rooms
  listRooms: (params: Record<string, string | number | undefined> = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v != null) as [string,string][]).toString();
    return request<Room[]>(`/rooms${q ? `?${q}` : ""}`, { revalidate: 60, mock: () => mockApi.listRooms(params) });
  },
  getRoom: (id: string) => request<Room | null>(`/rooms/${id}`, { revalidate: 60, mock: () => mockApi.getRoom(id) }),

  // Bookings
  createBooking: (data: any, token: string) => request<Booking>("/bookings", { method: "POST", body: JSON.stringify(data), token, mock: () => mockApi.createBooking(data) }),
  myBookings: (token: string) => request<Booking[]>("/bookings/me", { token, mock: () => mockApi.myBookings() }),
  cancelBooking: (id: string, token: string) => request<{ id: string }>(`/bookings/${id}`, { method: "DELETE", token, mock: () => mockApi.cancelBooking(id) }),

  // Blog
  listBlogs: (params: { category?: string; q?: string } = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v) as [string,string][]).toString();
    return request<Blog[]>(`/blogs${q ? `?${q}` : ""}`, { revalidate: 60, mock: () => mockApi.listBlogs(params) });
  },
  getBlog: (slug: string) => request<Blog | null>(`/blogs/${slug}`, { revalidate: 60, mock: () => mockApi.getBlog(slug) }),

  // Contact
  submitContact: (data: any) => request<{ ok: true }>("/contact", { method: "POST", body: JSON.stringify(data), mock: () => mockApi.submitContact(data) }),

  // Practitioner
  upsertMyPractitioner: (data: any, token: string) => request<any>("/practitioners/me", { method: "POST", body: JSON.stringify(data), token, mock: () => mockApi.upsertPractitioner(data) }),
};
