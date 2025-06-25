import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface UserDetails {
  name: string;
  email: string;
}

export interface Event {
  api_id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  date: string;
  location?: string;
  event?: {
    name: string;
    start_at: string;
    end_at?: string;
    cover_url?: string;
    url?: string;
  };
}

export interface FeedbackData {
  userDetails: UserDetails;
  transcript: any[];
  timestamp: string;
  eventId: string;
  eventName: string;
  overall_sentiment?: string;
  rating?: number;
  suggestions?: string[];
  genai_interest?: boolean;
  key_points?: string[];
}

export const userDetailsAtom = atom<UserDetails | null>(null);
export const selectedEventAtom = atom<Event | null>(null);
export const feedbackDataAtom = atom<FeedbackData | null>(null);
