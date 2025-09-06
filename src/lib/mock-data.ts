
export type DisasterUpdateReply = {
  author: string;
  message: string;
  timestamp: string;
};

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
  history: string[];
  replies: DisasterUpdateReply[];
};

export const mockDisasterUpdates: DisasterUpdate[] = [
    {
    id: 5,
    user: { name: "Anonymous", avatarUrl: "https://picsum.photos/id/404/40/40" },
    timestamp: "2024-07-23T14:00:00Z",
    disasterType: 'Fire',
    location: { latitude: 28.6139, longitude: 77.2090, name: "New Delhi" },
    message: "GAIL pipeline near the river exploded after damage from the recent floods. Huge fire, authorities need to be alerted immediately!",
    mediaUrl: "https://images.unsplash.com/photo-1599389814529-575f0a130097?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["Pipeline exploded an hour ago.", "Smoke is visible from miles away.", "The area has been evacuated."],
    replies: [
        { author: "Admin", message: "The problem has been reported to the concerned authorities and actions have been taken accordingly. Please stay clear of the area.", timestamp: "2024-07-23T14:15:00Z" }
    ],
  },
  {
    id: 1,
    user: { name: "Priya", avatarUrl: "https://picsum.photos/id/237/40/40" },
    timestamp: "2024-07-29T10:00:00Z",
    disasterType: 'Flood',
    location: { latitude: 19.0760, longitude: 72.8777, name: "Mumbai, MH" },
    message: "Major flooding in downtown Mumbai after monsoon rains. Streets are completely submerged.",
    mediaUrl: "https://images.unsplash.com/photo-1567654007013-3d64876fe8dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmbG9vZGluZ3xlbnwwfHx8fDE3NTcxNjg4MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    history: ["Water levels rising rapidly near Marine Drive.", "Evacuation orders issued for low-lying areas.", "Power outages reported in several neighborhoods."],
    replies: [
      { author: "Admin", message: "We are aware of the situation. Emergency services have been dispatched. Please stay indoors and away from flooded areas.", timestamp: "2024-07-29T10:15:00Z" }
    ],
  },
  {
    id: 2,
    user: { name: "Rohan", avatarUrl: "https://picsum.photos/id/238/40/40" },
    timestamp: "2024-07-29T09:30:00Z",
    disasterType: 'Earthquake',
    location: { latitude: 13.0827, longitude: 80.2707, name: "Chennai, TN" },
    message: "4.5 magnitude earthquake just hit. Light shaking felt across the city.",
    mediaUrl: "https://images.unsplash.com/photo-1593954264312-a714931a2a91?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    history: ["Minor cracks reported in some older buildings.", "No tsunami warning has been issued.", "Officials advise checking for structural damages."],
    replies: [
      { author: "Admin", message: "Our seismology team has confirmed the magnitude. No major damages reported yet. Please report any structural concerns to the city helpline.", timestamp: "2024-07-29T09:45:00Z" }
    ],
  },
  {
    id: 6,
    user: { name: "Aisha", avatarUrl: "https://picsum.photos/id/1027/40/40" },
    timestamp: "2024-07-28T22:00:00Z",
    disasterType: 'Landslide',
    location: { latitude: 31.1048, longitude: 77.1734, name: "Shimla, HP" },
    message: "Landslide on the main highway has blocked the road to the city. We are stranded.",
    mediaUrl: "https://images.unsplash.com/photo-1567654007013-3d64876fe8dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmbG9vZGluZ3xlbnwwfHx8fDE3NTcxNjg4MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    history: ["The road is completely blocked with debris.", "No alternate routes are open.", "Heavy rains are continuing."],
    replies: [
      { author: "Admin", message: "Road clearance crews are being dispatched. Please stay in a safe location away from the slide area. We will post updates as they come.", timestamp: "2024-07-28T22:15:00Z" }
    ],
  },
  {
    id: 3,
    user: { name: "Anjali", avatarUrl: "https://picsum.photos/id/239/40/40" },
    timestamp: "2024-07-29T08:00:00Z",
    disasterType: 'Fire',
    location: { latitude: 22.5726, longitude: 88.3639, name: "Kolkata, WB" },
    message: "Large fire at a warehouse near the port. Smoke is heavy in the region.",
    mediaUrl: "https://images.unsplash.com/photo-1603489297311-c794274574f2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    history: ["Air quality is poor. Stay indoors.", "Nearby roads are closed.", "Firefighters are on the scene working to control the blaze."],
    replies: [
        { author: "Admin", message: "Fire crews are on site. We advise residents in the vicinity to keep windows closed and avoid the area to allow emergency vehicles access.", timestamp: "2024-07-29T08:20:00Z" }
    ],
  },
    {
    id: 4,
    user: { name: "Vikram", avatarUrl: "https://picsum.photos/id/240/40/40" },
    timestamp: "2024-07-28T18:00:00Z",
    disasterType: 'Hurricane',
    location: { latitude: 15.2993, longitude: 74.1240, name: "Goa" },
    message: "Cyclone making landfall. Strong winds and storm surge expected.",
    mediaUrl: "https://images.unsplash.com/photo-1561075104-e34b992f4e41?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    history: ["Mandatory evacuations for coastal areas.", "Shelters are open at local schools and community centers.", "Expect widespread power outages."],
    replies: [
        { author: "Admin", message: "This is a severe weather event. Please follow all evacuation orders and tune into local news for the latest updates on shelters and safety measures.", timestamp: "2024-07-28T18:30:00Z" }
    ],
  },
  {
    id: 7,
    user: { name: "Sameer", avatarUrl: "https://picsum.photos/id/1005/40/40" },
    timestamp: "2024-07-27T11:45:00Z",
    disasterType: 'Power Outage',
    location: { latitude: 26.9124, longitude: 75.7873, name: "Jaipur, RJ" },
    message: "Power has been out for over 12 hours in our area after the dust storm. Any update on restoration?",
    mediaUrl: "https://images.unsplash.com/photo-1580258956422-834c81d739b8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    history: ["The entire neighborhood is dark.", "Phones are running out of battery.", "No official communication from the power company yet."],
    replies: [
        { author: "Admin", message: "Crews are working to restore power. Estimated time for restoration is 8 PM tonight. We apologize for the inconvenience.", timestamp: "2024-07-27T12:00:00Z" }
    ],
  }
];
