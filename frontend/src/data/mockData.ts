export interface Exhibition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  time: string;
  venue: string;
  totalStalls: number;
  stalls: StallCategory[];
  status: "upcoming" | "ongoing" | "completed";
  layoutImage?: string;
  layoutHistory?: string[];
  galleryImages?: string[];
  videoLinks?: string[];
  stallNumbers?: StallInstance[];
  showRevenueToExhibitors?: boolean;
  assignedOrganizers?: string[];
}

export interface StallInstance {
  id: string;
  number: string;
  category: "Prime" | "Super" | "General";
  price: number;
  status: "available" | "booked" | "reserved";
  bookedBy?: string;
}

export interface StallCategory {
  category: "Prime" | "Super" | "General";
  price: number;
  total: number;
  booked: number;
}

export interface Booking {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  exhibitionId: string;
  exhibitionName: string;
  stallCategory: "Prime" | "Super" | "General";
  price: number;
  status: "pending" | "confirmed" | "cancelled";
  bookedAt: string;
}

export interface FacilityRequest {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  exhibitionId: string;
  chairs: number;
  tables: number;
  lights: number;
  electricity: boolean;
  custom: string;
  status: "pending" | "fulfilled";
}

export interface Complaint {
  id: string;
  exhibitorId: string;
  exhibitorName: string;
  exhibitionId: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  exhibitorName: string;
  exhibitionName: string;
  stallCategory: string;
  price: number;
  generatedAt: string;
}

function generateStallInstances(exId: string, stalls: StallCategory[]): StallInstance[] {
  const instances: StallInstance[] = [];
  let num = 1;
  for (const sc of stalls) {
    for (let i = 0; i < sc.total; i++) {
      instances.push({
        id: `${exId}-s${num}`,
        number: `S${String(num).padStart(3, "0")}`,
        category: sc.category,
        price: sc.price,
        status: i < sc.booked ? "booked" : "available",
      });
      num++;
    }
  }
  return instances;
}

const ex1Stalls: StallCategory[] = [
  { category: "Prime", price: 15000, total: 10, booked: 7 },
  { category: "Super", price: 10000, total: 20, booked: 12 },
  { category: "General", price: 5000, total: 20, booked: 8 },
];

const ex2Stalls: StallCategory[] = [
  { category: "Prime", price: 20000, total: 15, booked: 15 },
  { category: "Super", price: 12000, total: 30, booked: 20 },
  { category: "General", price: 7000, total: 35, booked: 10 },
];

const ex3Stalls: StallCategory[] = [
  { category: "Prime", price: 18000, total: 12, booked: 12 },
  { category: "Super", price: 11000, total: 25, booked: 25 },
  { category: "General", price: 6000, total: 30, booked: 30 },
];

export const exhibitions: Exhibition[] = [
  {
    id: "ex1",
    name: "AMRUT Peth Kisan Mela 2025",
    startDate: "2025-04-10",
    endDate: "2025-04-15",
    time: "10:00 AM - 8:00 PM",
    venue: "AMRUT Peth Ground, Pune",
    totalStalls: 50,
    stalls: ex1Stalls,
    status: "upcoming",
    stallNumbers: generateStallInstances("ex1", ex1Stalls),
    galleryImages: [],
    videoLinks: [],
    showRevenueToExhibitors: true,
    assignedOrganizers: ["2"],
  },
  {
    id: "ex2",
    name: "Agri Trade Fair 2025",
    startDate: "2025-05-01",
    endDate: "2025-05-05",
    time: "9:00 AM - 7:00 PM",
    venue: "Central Market Hall, Nagpur",
    totalStalls: 80,
    stalls: ex2Stalls,
    status: "ongoing",
    stallNumbers: generateStallInstances("ex2", ex2Stalls),
    galleryImages: [],
    videoLinks: [],
    showRevenueToExhibitors: false,
    assignedOrganizers: ["2"],
  },
  {
    id: "ex3",
    name: "Krishi Expo 2024",
    startDate: "2024-11-01",
    endDate: "2024-11-05",
    time: "9:00 AM - 6:00 PM",
    venue: "Agricultural Exhibition Center, Mumbai",
    totalStalls: 67,
    stalls: ex3Stalls,
    status: "completed",
    stallNumbers: generateStallInstances("ex3", ex3Stalls),
    galleryImages: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400",
      "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=400",
    ],
    videoLinks: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    showRevenueToExhibitors: false,
    assignedOrganizers: ["2"],
  },
];

export const bookings: Booking[] = [
  { id: "b1", exhibitorId: "3", exhibitorName: "Green Farms Ltd", exhibitionId: "ex1", exhibitionName: "AMRUT Peth Kisan Mela 2025", stallCategory: "Prime", price: 15000, status: "confirmed", bookedAt: "2025-03-15" },
  { id: "b2", exhibitorId: "3", exhibitorName: "Organic Seeds Co", exhibitionId: "ex1", exhibitionName: "AMRUT Peth Kisan Mela 2025", stallCategory: "Super", price: 10000, status: "pending", bookedAt: "2025-03-18" },
  { id: "b3", exhibitorId: "3", exhibitorName: "AgriTech Solutions", exhibitionId: "ex2", exhibitionName: "Agri Trade Fair 2025", stallCategory: "General", price: 7000, status: "confirmed", bookedAt: "2025-03-20" },
];

export const facilityRequests: FacilityRequest[] = [
  { id: "f1", exhibitorId: "3", exhibitorName: "Green Farms Ltd", exhibitionId: "ex1", chairs: 4, tables: 2, lights: 3, electricity: true, custom: "Extension board", status: "pending" },
  { id: "f2", exhibitorId: "3", exhibitorName: "Organic Seeds Co", exhibitionId: "ex1", chairs: 2, tables: 1, lights: 2, electricity: true, custom: "", status: "fulfilled" },
];

export const complaints: Complaint[] = [
  { id: "c1", exhibitorId: "3", exhibitorName: "Green Farms Ltd", exhibitionId: "ex1", subject: "Water supply issue", description: "No water supply near stall area", status: "open", createdAt: "2025-03-20" },
];

export const invoices: Invoice[] = [
  { id: "inv1", bookingId: "b1", exhibitorName: "Green Farms Ltd", exhibitionName: "AMRUT Peth Kisan Mela 2025", stallCategory: "Prime", price: 15000, generatedAt: "2025-03-15" },
  { id: "inv2", bookingId: "b3", exhibitorName: "AgriTech Solutions", exhibitionName: "Agri Trade Fair 2025", stallCategory: "General", price: 7000, generatedAt: "2025-03-20" },
];
