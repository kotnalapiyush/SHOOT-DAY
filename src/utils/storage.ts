import { PhotographerProfile, ShootBooking, NotificationItem, DayStatus } from '../types';

const _seedNow = new Date();
export const APP_CURRENT_YEAR = _seedNow.getFullYear();
export const APP_CURRENT_MONTH = _seedNow.getMonth();

const STORAGE_KEYS = {
  PHOTOGRAPHERS: 'shoot_socialbae_photographers_v10',
  AVAILABILITY: 'shoot_socialbae_availability_v10',
  SHOOTS: 'shoot_socialbae_shoots_v10',
  NOTIFICATIONS: 'shoot_socialbae_notifications_v10',
  ACTIVE_PHOTOGRAPHER: 'shoot_socialbae_active_id_v10',
};

export const INITIAL_PHOTOGRAPHERS: PhotographerProfile[] = [
  {
    id: 'photo-1',
    name: 'Rohan Sharma',
    city: 'Delhi NCR',
    title: 'Commercial, Brand & Product Campaign Lead',
    phone: '+91 98101 23456',
    email: 'rohan.sharma@lensdelhi.in',
    loginEmail: 'rohan.sharma@lensdelhi.in',
    loginPassword: 'rohan123',
    bio: '10+ years directing high-impact commercial campaigns, F&B food staging, and luxury brand lookbooks across Delhi NCR.',
    specialties: ['Commercial Shoot', 'Product Shoot', 'F&B Shoot', 'One Day Shoot'],
    experienceYears: 10,
    avatarColor: 'from-amber-600 to-amber-700',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-2',
    name: 'Ananya Sen',
    city: 'Mumbai',
    title: 'Editorial Fashion & Luxury Jewellery Specialist',
    phone: '+91 98200 87654',
    email: 'ananya.sen@mumbaiclicks.in',
    loginEmail: 'ananya.sen@mumbaiclicks.in',
    loginPassword: 'ananya123',
    bio: 'Leading fashion and jewellery photographer in Mumbai. Specializes in luxury campaign styling, macro jewellery details, and high-fashion editorials.',
    specialties: ['Fashion Shoot', 'Jewellery Shoot', 'Commercial Shoot', 'One Day Shoot'],
    experienceYears: 7,
    avatarColor: 'from-rose-600 to-pink-700',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-3',
    name: 'Vikramaditya Verma',
    city: 'Jaipur & Udaipur',
    title: 'Heritage Hotels, Architecture & Interior Specialist',
    phone: '+91 94140 11223',
    email: 'vikram.verma@rajasthanheritage.com',
    loginEmail: 'vikram.verma@rajasthanheritage.com',
    loginPassword: 'vikram123',
    bio: 'Specializes in architectural photography, luxury heritage hotel productions, and interior design visual storytelling across Rajasthan and Delhi.',
    specialties: ['Hotel Shoot', 'Interior Shoot', 'Commercial Shoot', 'One Day Shoot'],
    experienceYears: 12,
    avatarColor: 'from-orange-600 to-amber-800',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-4',
    name: 'Priya Nair',
    city: 'Bengaluru',
    title: 'Culinary, F&B, Restaurant & Cafe Visual Creator',
    phone: '+91 98450 55443',
    email: 'priya.nair@bengalurustories.in',
    loginEmail: 'priya.nair@bengalurustories.in',
    loginPassword: 'priya123',
    bio: 'Specialist in food styling, artisanal cocktail menus, cafe interiors, and brand storytelling for top culinary and hospitality groups.',
    specialties: ['F&B Shoot', 'Restaurant & Cafe Shoot', 'Product Shoot', 'One Day Shoot'],
    experienceYears: 8,
    avatarColor: 'from-emerald-600 to-teal-800',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-5',
    name: 'Kabir Mehta',
    city: 'Goa',
    title: 'Resort, Hospitality, Lifestyle & Brand Filmmaker',
    phone: '+91 98221 99887',
    email: 'kabir.mehta@goawedd.in',
    loginEmail: 'kabir.mehta@goawedd.in',
    loginPassword: 'kabir123',
    bio: 'Boutique hotel, coastal resort, cafe lifestyle, and commercial brand productions across Goa and Mumbai.',
    specialties: ['Hotel Shoot', 'Restaurant & Cafe Shoot', 'Commercial Shoot', 'One Day Shoot'],
    experienceYears: 6,
    avatarColor: 'from-cyan-600 to-blue-800',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
];

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDayMonth(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${d} ${monthNames[m - 1] || ''}`;
}

// Initial data generator
function getInitialSeedData() {
  const y = APP_CURRENT_YEAR;
  const m = APP_CURRENT_MONTH;

  const makeDate = (day: number, monthOffset = 0) => {
    return formatDateKey(new Date(y, m + monthOffset, day));
  };

  const shoots: ShootBooking[] = [
    {
      id: 'shoot-1',
      photographerId: 'photo-1',
      date: makeDate(12),
      clientName: "OG's Cafe & Street Culture",
      clientPhone: '+91 98111 22334',
      cityVenue: "OG's Cafe, Delhi NCR",
      shootType: 'Restaurant & Cafe Shoot',
      moodBoardUrl: 'https://drive.google.com/drive/folders/1A5qxC2DNS3tz4Y001YbS9GZuMi58kuLH',
      shootBrief: 'Capturing artisanal cold brew series, burger stacks, street culture lifestyle, and 4K social motion cutdowns.',
      timingStart: '15:00',
      timingEnd: '23:00',
      durationHours: '8 Hours',
      approxIdea: 'Barista stations, burger plating, outdoor neon cafe lighting.',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'confirmed',
    },
    {
      id: 'shoot-2',
      photographerId: 'photo-1',
      date: makeDate(18),
      clientName: 'Doner & Burger Campaign',
      clientPhone: '+91 98710 44556',
      cityVenue: 'Doner & Burger Central Studio, Delhi',
      shootType: 'Commercial Shoot',
      moodBoardUrl: 'https://drive.google.com/drive/folders/1-XNzXk_8vxFeJKR2kfteD3hF3IKp9cGE',
      shootBrief: 'Hero commercial photography for signature brioche smash burgers, crispy fries, wraps, and billboard masters.',
      timingStart: '10:00',
      timingEnd: '18:00',
      durationHours: '8 Hours',
      approxIdea: '2 camera setup, macro food stylist on set, billboard resolution stills.',
      source: 'photographer_direct',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'confirmed',
    },
    {
      id: 'shoot-completed-1',
      photographerId: 'photo-1',
      date: makeDate(4),
      clientName: 'Box of Cake Patisserie',
      clientPhone: '+91 98102 33445',
      cityVenue: 'Box of Cake Bakery, Gurgaon',
      shootType: 'F&B Shoot',
      moodBoardUrl: 'https://drive.google.com/drive/folders/1Z1uvGOasctr0w2SJLNpKXhMC_d6MDVF1',
      shootBrief: 'Decadent bakery slices, sourdough croissant folds, chocolate ganache drip, and festive pastry packaging.',
      timingStart: '07:00',
      timingEnd: '12:00',
      durationHours: '5 Hours',
      approxIdea: 'Morning directional sunlight, rustic marble backdrops, food director on site.',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-3',
      photographerId: 'photo-3',
      date: makeDate(15),
      clientName: 'The Oberoi Rajvilas',
      clientPhone: '+91 98290 33445',
      cityVenue: 'The Oberoi Rajvilas, Jaipur',
      shootType: 'Hotel Shoot',
      moodBoardUrl: 'https://pinterest.com/pin/luxury-resort-hospitality',
      shootBrief: 'Luxury suite interiors, pool courtyard, and royal dining pavilion architecture.',
      timingStart: '10:00',
      timingEnd: '20:00',
      durationHours: '10 Hours (Full Day)',
      approxIdea: 'Heritage architecture, luxury suites, dusk twilight lighting.',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'confirmed',
    },
    {
      id: 'shoot-4',
      photographerId: 'photo-2',
      date: makeDate(14),
      clientName: 'Nicobar Fashion Lookbook',
      clientPhone: '+91 98205 99112',
      cityVenue: 'Kala Ghoda Heritage Precinct, Mumbai',
      shootType: 'Fashion Shoot',
      moodBoardUrl: 'https://pinterest.com/pin/mumbai-street-fashion',
      shootBrief: 'Autumn-Winter apparel lookbook with sustainable fabrics and outdoor natural light.',
      timingStart: '15:00',
      timingEnd: '19:30',
      durationHours: '4.5 Hours',
      approxIdea: '2 fashion models, 8 outfits, editorial street aesthetic.',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: 'confirmed',
    },
    // --- Previous Month (-1 Month) Historical Shoots ---
    {
      id: 'shoot-prev-1',
      photographerId: 'photo-1',
      date: makeDate(8, -1),
      clientName: 'FabIndia Home Decor',
      clientPhone: '+91 98101 11223',
      cityVenue: 'Studio 22, Okhla Delhi',
      shootType: 'Interior Shoot',
      timingStart: '10:00',
      timingEnd: '18:00',
      durationHours: '8 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
      status: 'completed',
      shootBrief: 'Showcasing luxury handcrafted furniture sets and textile home decor setups.',
    },
    {
      id: 'shoot-prev-2',
      photographerId: 'photo-1',
      date: makeDate(16, -1),
      clientName: 'Boat Audio Lifestyle Campaign',
      clientPhone: '+91 98112 33445',
      cityVenue: 'Connaught Place & Studio, Delhi',
      shootType: 'Product Shoot',
      timingStart: '09:00',
      timingEnd: '17:00',
      durationHours: '8 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 28).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-3',
      photographerId: 'photo-1',
      date: makeDate(22, -1),
      clientName: 'Burma Burma Restaurant & Tea Room',
      clientPhone: '+91 98188 44556',
      cityVenue: 'Select Citywalk, Saket Delhi',
      shootType: 'Restaurant & Cafe Shoot',
      timingStart: '11:00',
      timingEnd: '17:30',
      durationHours: '6.5 Hours',
      source: 'photographer_direct',
      createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-4',
      photographerId: 'photo-3',
      date: makeDate(10, -1),
      clientName: 'Suján Rajmahal Palace',
      clientPhone: '+91 94140 88990',
      cityVenue: 'Rajmahal Palace, Jaipur',
      shootType: 'Hotel Shoot',
      timingStart: '08:00',
      timingEnd: '20:00',
      durationHours: '12 Hours (One Day Shoot)',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 33).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-5',
      photographerId: 'photo-3',
      date: makeDate(24, -1),
      clientName: 'Studio Lotus Architecture Shoot',
      clientPhone: '+91 94140 77665',
      cityVenue: 'Luxury Penthouse, Jaipur',
      shootType: 'Interior Shoot',
      timingStart: '10:00',
      timingEnd: '17:00',
      durationHours: '7 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-6',
      photographerId: 'photo-2',
      date: makeDate(12, -1),
      clientName: 'Forest Essentials Skin Care',
      clientPhone: '+91 98200 11223',
      cityVenue: 'Bandra Studio, Mumbai',
      shootType: 'Commercial Shoot',
      timingStart: '10:00',
      timingEnd: '18:00',
      durationHours: '8 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 32).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-7',
      photographerId: 'photo-4',
      date: makeDate(18, -1),
      clientName: 'Third Wave Coffee Flagship',
      clientPhone: '+91 98450 11998',
      cityVenue: 'Indiranagar 100ft Road, Bengaluru',
      shootType: 'Restaurant & Cafe Shoot',
      timingStart: '08:00',
      timingEnd: '17:00',
      durationHours: '9 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 26).toISOString(),
      status: 'completed',
    },
    // --- 2 Months Ago (-2 Months) Historical Shoots ---
    {
      id: 'shoot-prev-8',
      photographerId: 'photo-1',
      date: makeDate(5, -2),
      clientName: 'Amrapali Jewels Catalogue',
      clientPhone: '+91 98101 99887',
      cityVenue: 'Roseate House, Aerocity Delhi',
      shootType: 'Jewellery Shoot',
      timingStart: '11:00',
      timingEnd: '19:00',
      durationHours: '8 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 65).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-9',
      photographerId: 'photo-1',
      date: makeDate(19, -2),
      clientName: 'H&M Summer Campaign',
      clientPhone: '+91 98100 55443',
      cityVenue: 'DLF CyberCity Studios',
      shootType: 'Fashion Shoot',
      timingStart: '09:00',
      timingEnd: '17:00',
      durationHours: '8 Hours (One Day Shoot)',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 52).toISOString(),
      status: 'completed',
    },
    {
      id: 'shoot-prev-10',
      photographerId: 'photo-3',
      date: makeDate(14, -2),
      clientName: 'Rambagh Palace Hospitality',
      clientPhone: '+91 94140 22331',
      cityVenue: 'Rambagh Palace, Jaipur',
      shootType: 'Hotel Shoot',
      timingStart: '10:00',
      timingEnd: '18:00',
      durationHours: '8 Hours',
      source: 'client_booking',
      createdAt: new Date(Date.now() - 86400000 * 57).toISOString(),
      status: 'completed',
    },
  ];

  // Seed availability for each photographer across past 3 months (-3, -2, -1), current (0), and next 2 months (+1, +2)
  const availability: Record<string, Record<string, DayStatus>> = {};

  INITIAL_PHOTOGRAPHERS.forEach((p) => {
    availability[p.id] = {};
    for (const offset of [-3, -2, -1, 0, 1, 2]) {
      const daysInTargetMonth = new Date(y, m + offset + 1, 0).getDate();
      for (let d = 1; d <= daysInTargetMonth; d++) {
        const dKey = makeDate(d, offset);
        availability[p.id][dKey] = 'available';
      }
    }
  });

  // Mark all sample shoots as booked
  shoots.forEach((s) => {
    if (availability[s.photographerId]) {
      availability[s.photographerId][s.date] = 'booked';
    }
  });

  // Additional booked dates across months to reflect realistic studio busy days
  availability['photo-1'][makeDate(24, 0)] = 'booked';
  availability['photo-1'][makeDate(27, -1)] = 'booked';
  availability['photo-1'][makeDate(12, -2)] = 'booked';
  availability['photo-1'][makeDate(26, -2)] = 'booked';

  availability['photo-2'][makeDate(20, -1)] = 'booked';
  availability['photo-2'][makeDate(25, -1)] = 'booked';
  availability['photo-2'][makeDate(18, -2)] = 'booked';

  availability['photo-3'][makeDate(16, 0)] = 'booked';
  availability['photo-3'][makeDate(17, 0)] = 'booked';
  availability['photo-3'][makeDate(5, -1)] = 'booked';
  availability['photo-3'][makeDate(28, -1)] = 'booked';
  availability['photo-3'][makeDate(21, -2)] = 'booked';

  availability['photo-4'][makeDate(20, 0)] = 'booked';
  availability['photo-4'][makeDate(8, -1)] = 'booked';
  availability['photo-4'][makeDate(22, -1)] = 'booked';
  availability['photo-4'][makeDate(15, -2)] = 'booked';

  availability['photo-5'][makeDate(12, 0)] = 'booked';
  availability['photo-5'][makeDate(19, -1)] = 'booked';
  availability['photo-5'][makeDate(27, -1)] = 'booked';

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      photographerId: 'photo-1',
      title: 'New Shoot Booked!',
      message: 'Tata Starbucks Reserve booked for Restaurant & Cafe Shoot.',
      date: makeDate(12),
      clientName: 'Tata Starbucks Reserve',
      clientPhone: '+91 98111 22334',
      shootType: 'Restaurant & Cafe Shoot',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  return { photographers: INITIAL_PHOTOGRAPHERS, availability, shoots, notifications };
}

// Broadcast updates across tabs
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel('photo_cal_in_sync_v3');
} catch {
  // Not supported or blocked
}

export function broadcastUpdate(type: string, payload?: unknown) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, payload });
  }
}

export function subscribeToUpdates(callback: (type: string, payload?: unknown) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type) {
      callback(e.data.type, e.data.payload);
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export function loadPhotographers(): PhotographerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PHOTOGRAPHERS);
    if (raw) {
      const parsed: PhotographerProfile[] = JSON.parse(raw);
      const populated = parsed.map((p) => {
        const cleanFirst = p.name?.split(' ')[0]?.toLowerCase() || 'photog';
        const defaultProfile = INITIAL_PHOTOGRAPHERS.find((ip) => ip.id === p.id);
        const hasValidSamples = p.portfolioSamples && p.portfolioSamples.length > 0 && !p.portfolioSamples[0].includes('googleusercontent.com');
        return {
          ...p,
          portfolioSamples: hasValidSamples ? p.portfolioSamples : (defaultProfile?.portfolioSamples || []),
          loginEmail: p.loginEmail || p.email,
          loginPassword: p.loginPassword || `${cleanFirst}123`,
        };
      });
      return populated;
    }
  } catch (err) {
    console.error('Failed to load photographers', err);
  }
  const seed = getInitialSeedData();
  savePhotographers(seed.photographers);
  saveAvailability(seed.availability);
  saveShoots(seed.shoots);
  saveNotifications(seed.notifications);
  return seed.photographers;
}

export function savePhotographers(photographers: PhotographerProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PHOTOGRAPHERS, JSON.stringify(photographers));
    broadcastUpdate('PHOTOGRAPHERS_UPDATED');
  } catch (err) {
    console.error('Failed to save photographers', err);
  }
}

export function loadAvailability(): Record<string, Record<string, DayStatus>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load availability', err);
  }
  const seed = getInitialSeedData();
  return seed.availability;
}

export function saveAvailability(avail: Record<string, Record<string, DayStatus>>) {
  try {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(avail));
    broadcastUpdate('AVAILABILITY_UPDATED');
  } catch (err) {
    console.error('Failed to save availability', err);
  }
}

export function loadShoots(): ShootBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOOTS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load shoots', err);
  }
  const seed = getInitialSeedData();
  return seed.shoots;
}

export function saveShoots(shoots: ShootBooking[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOOTS, JSON.stringify(shoots));
    broadcastUpdate('SHOOTS_UPDATED');
  } catch (err) {
    console.error('Failed to save shoots', err);
  }
}

export function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load notifications', err);
  }
  const seed = getInitialSeedData();
  return seed.notifications;
}

export function saveNotifications(notifs: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    broadcastUpdate('NOTIFICATIONS_UPDATED');
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
}

export function loadActivePhotographerId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PHOTOGRAPHER);
    if (id) return id;
  } catch (err) {
    console.error(err);
  }
  return 'photo-1';
}

export function saveActivePhotographerId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PHOTOGRAPHER, id);
    broadcastUpdate('ACTIVE_PHOTOGRAPHER_CHANGED');
  } catch (err) {
    console.error(err);
  }
}
