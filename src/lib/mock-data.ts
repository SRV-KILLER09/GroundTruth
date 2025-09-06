export type DisasterUpdate = {
  id: number;
  user: {
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  disasterType: 'Flood' | 'Earthquake' | 'Fire' | 'Hurricane';
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
    user: { name: "Alice", avatarUrl: "https://picsum.photos/id/237/40/40" },
    timestamp: "2024-07-29T10:00:00Z",
    disasterType: 'Flood',
    location: { latitude: 34.0522, longitude: -118.2437, name: "Los Angeles, CA" },
    message: "Major flooding in downtown LA. Streets are completely submerged.",
    mediaUrl: "https://picsum.photos/seed/flood1/600/400",
    updates: ["Water levels rising rapidly near Union Station.", "Evacuation orders issued for low-lying areas.", "Power outages reported in several neighborhoods."],
  },
  {
    id: 2,
    user: { name: "Bob", avatarUrl: "https://picsum.photos/id/238/40/40" },
    timestamp: "2024-07-29T09:30:00Z",
    disasterType: 'Earthquake',
    location: { latitude: 37.7749, longitude: -122.4194, name: "San Francisco, CA" },
    message: "6.8 magnitude earthquake just hit. Significant shaking felt across the bay area.",
    updates: ["Reports of structural damage to older buildings.", "Tsunami warning has not been issued.", "Check for gas leaks and turn off if necessary."],
  },
  {
    id: 3,
    user: { name: "Charlie", avatarUrl: "https://picsum.photos/id/239/40/40" },
    timestamp: "2024-07-29T08:00:00Z",
    disasterType: 'Fire',
    location: { latitude: 38.9295, longitude: -120.0324, name: "Lake Tahoe Area" },
    message: "Wildfire spreading quickly near South Lake Tahoe. Smoke is heavy in the region.",
    mediaUrl: "https://picsum.photos/seed/fire1/600/400",
    updates: ["Air quality is hazardous. Stay indoors.", "Evacuation warnings for residents near Emerald Bay.", "Firefighters are working to establish containment lines."],
  },
    {
    id: 4,
    user: { name: "Diana", avatarUrl: "https://picsum.photos/id/240/40/40" },
    timestamp: "2024-07-28T18:00:00Z",
    disasterType: 'Hurricane',
    location: { latitude: 25.7617, longitude: -80.1918, name: "Miami, FL" },
    message: "Hurricane Zeta making landfall. Category 4 winds and storm surge expected.",
    mediaUrl: "https://picsum.photos/seed/hurricane1/600/400",
    updates: ["Mandatory evacuations for coastal areas.", "Shelters are open at local schools and community centers.", "Expect widespread power outages."],
  },
];
