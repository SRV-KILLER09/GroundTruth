export type DisasterUpdate = {
  id: number;
  user: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  disasterType: 'Flood' | 'Earthquake' | 'Fire' | 'Hurricane' | string; // Allow custom strings
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  message: string;
  mediaUrl?: string;
  updates: string[];
};

export const mockDisasterUpdates: DisasterUpdate[] = [
  {
    id: 1,
    user: { name: "Priya", avatarUrl: "https://picsum.photos/id/237/40/40" },
    timestamp: "2024-07-29T10:00:00Z",
    disasterType: 'Flood',
    location: { latitude: 19.0760, longitude: 72.8777, name: "Mumbai, MH" },
    message: "Major flooding in downtown Mumbai after monsoon rains. Streets are completely submerged.",
    mediaUrl: "https://picsum.photos/seed/flood1/600/400",
    updates: ["Water levels rising rapidly near Marine Drive.", "Evacuation orders issued for low-lying areas.", "Power outages reported in several neighborhoods."],
  },
  {
    id: 2,
    user: { name: "Rohan", avatarUrl: "https://picsum.photos/id/238/40/40" },
    timestamp: "2024-07-29T09:30:00Z",
    disasterType: 'Earthquake',
    location: { latitude: 13.0827, longitude: 80.2707, name: "Chennai, TN" },
    message: "4.5 magnitude earthquake just hit. Light shaking felt across the city.",
    updates: ["Minor cracks reported in some older buildings.", "No tsunami warning has been issued.", "Officials advise checking for structural damages."],
  },
  {
    id: 3,
    user: { name: "Anjali", avatarUrl: "https://picsum.photos/id/239/40/40" },
    timestamp: "2024-07-29T08:00:00Z",
    disasterType: 'Fire',
    location: { latitude: 22.5726, longitude: 88.3639, name: "Kolkata, WB" },
    message: "Large fire at a warehouse near the port. Smoke is heavy in the region.",
    mediaUrl: "https://picsum.photos/seed/fire1/600/400",
    updates: ["Air quality is poor. Stay indoors.", "Nearby roads are closed.", "Firefighters are on the scene working to control the blaze."],
  },
    {
    id: 4,
    user: { name: "Vikram", avatarUrl: "https://picsum.photos/id/240/40/40" },
    timestamp: "2024-07-28T18:00:00Z",
    disasterType: 'Hurricane',
    location: { latitude: 15.2993, longitude: 74.1240, name: "Goa" },
    message: "Cyclone making landfall. Strong winds and storm surge expected.",
    mediaUrl: "https://picsum.photos/seed/hurricane1/600/400",
    updates: ["Mandatory evacuations for coastal areas.", "Shelters are open at local schools and community centers.", "Expect widespread power outages."],
  },
];
