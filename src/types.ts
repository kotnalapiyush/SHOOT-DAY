export type DayStatus = 'available' | 'booked';

export type ShootType =
  | 'Commercial Shoot'
  | 'One Day Shoot'
  | 'F&B Shoot'
  | 'Restaurant & Cafe Shoot'
  | 'Interior Shoot'
  | 'Hotel Shoot'
  | 'Fashion Shoot'
  | 'Jewellery Shoot'
  | 'Product Shoot'
  | 'Other / Custom Requirement';

export interface PhotographerProfile {
  id: string;
  name: string;
  city: string; // e.g. "Delhi NCR", "Mumbai", "Jaipur / Udaipur", "Bengaluru", "Goa"
  title: string; // e.g. "Commercial, Brand & Product Campaign Lead"
  phone: string; // +91 format
  email: string;
  bio: string;
  specialties: string[];
  experienceYears: number;
  avatarColor: string;
  avatarUrl?: string;
  portfolioSamples?: string[];
  loginEmail?: string;
  loginPassword?: string;
}

export type UserRole = 'public_client' | 'photographer' | 'admin';

export interface AuthSession {
  role: 'photographer' | 'admin';
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  photographerId?: string;
}

export interface ShootBooking {
  id: string;
  photographerId: string;
  date: string; // YYYY-MM-DD
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  cityVenue: string; // Shoot Location / Venue
  shootType: string; // Type of shoot
  moodBoardUrl?: string; // Mood board link (Pinterest/Drive/Canva)
  shootBrief?: string; // Brief of the shoot
  timingStart?: string; // Start time (e.g. "14:00")
  timingEnd?: string; // End time (e.g. "20:00")
  durationHours?: string | number; // Number of hours of shoot
  approxIdea?: string; // Any approx idea (guest count, setup, outfits)
  notes?: string;
  source: 'client_booking' | 'photographer_direct';
  createdAt: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface NotificationItem {
  id: string;
  photographerId: string;
  title: string;
  message: string;
  date: string;
  clientName?: string;
  clientPhone?: string;
  shootType?: string;
  read: boolean;
  createdAt: string;
}
