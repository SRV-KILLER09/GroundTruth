
export type DisasterUpdateReply = {
  author: string;
  message: string;
  timestamp: string;
};

export type DisasterStatus = 'Verified' | 'Under Investigation' | 'Fake';

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
  status: DisasterStatus;
  authority: 'NDRF' | 'Local Police' | 'Fire Dept.' | 'Medical Team';
};

export type MockNewsItem = {
    source: string;
    headline: string;
    summary: string;
    timestamp: string;
    link: string;
    category: string;
    categoryType: "alert" | "news" | "corporate";
};

export type Announcement = {
  id: number;
  message: string;
  timestamp: string;
};


export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    message: "Scheduled system maintenance on July 30th from 2:00 AM to 4:00 AM. The platform may be temporarily unavailable.",
    timestamp: "2025-07-28T10:00:00Z",
  },
  {
    id: 2,
    message: "Our new AI-powered image verification system is now live. Reports with images will be analyzed for authenticity.",
    timestamp: "2025-07-27T15:30:00Z",
  }
];


export const mockDisasterUpdates: DisasterUpdate[] = [
    {
    id: 5,
    user: { name: "Anonymous", avatarUrl: "https://picsum.photos/id/404/40/40" },
    timestamp: "2025-07-23T14:00:00Z",
    disasterType: 'Fire',
    location: { latitude: 28.6139, longitude: 77.2090, name: "New Delhi" },
    message: "GAIL pipeline near the river exploded after damage from the recent floods. Huge fire, authorities need to be alerted immediately!",
    mediaUrl: "https://images.unsplash.com/photo-1603489297311-c794274574f2?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["Pipeline exploded an hour ago.", "Smoke is visible from miles away.", "The area has been evacuated."],
    replies: [
        { author: "Admin", message: "The problem has been reported to the concerned authorities and actions have been taken accordingly. Please stay clear of the area.", timestamp: "2025-07-23T14:15:00Z" }
    ],
    status: 'Verified',
    authority: 'Fire Dept.',
  },
  {
    id: 1,
    user: { name: "Priya", avatarUrl: "https://picsum.photos/id/237/40/40" },
    timestamp: "2025-07-29T10:00:00Z",
    disasterType: 'Flood',
    location: { latitude: 19.0760, longitude: 72.8777, name: "Mumbai, MH" },
    message: "Major flooding in downtown Mumbai after monsoon rains. Streets are completely submerged.",
    mediaUrl: "https://images.unsplash.com/photo-1582574049441-79172f6a73a2?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["Water levels rising rapidly near Marine Drive.", "Evacuation orders issued for low-lying areas.", "Power outages reported in several neighborhoods."],
    replies: [
      { author: "Admin", message: "We are aware of the situation. Emergency services have been dispatched. Please stay indoors and away from flooded areas.", timestamp: "2025-07-29T10:15:00Z" }
    ],
    status: 'Verified',
    authority: 'NDRF',
  },
  {
    id: 2,
    user: { name: "Rohan", avatarUrl: "https://picsum.photos/id/238/40/40" },
    timestamp: "2025-07-29T09:30:00Z",
    disasterType: 'Earthquake',
    location: { latitude: 13.0827, longitude: 80.2707, name: "Chennai, TN" },
    message: "4.5 magnitude earthquake just hit. Light shaking felt across the city.",
    mediaUrl: "https://images.unsplash.com/photo-1513483329936-8fa84a89667a?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["Minor cracks reported in some older buildings.", "No tsunami warning has been issued.", "Officials advise checking for structural damages."],
    replies: [
      { author: "Admin", message: "Our seismology team has confirmed the magnitude. No major damages reported yet. Please report any structural concerns to the city helpline.", timestamp: "2025-07-29T09:45:00Z" }
    ],
    status: 'Verified',
    authority: 'NDRF',
  },
  {
    id: 8,
    user: { name: "ConcernedCitizen", avatarUrl: "https://picsum.photos/id/512/40/40" },
    timestamp: "2025-07-25T11:00:00Z",
    disasterType: 'Tsunami',
    location: { latitude: 13.0827, longitude: 80.2707, name: "Chennai, TN" },
    message: "There is a Tsunami coming!! The waves are 100 feet high and will hit the shore in 5 minutes! Evacuate now!",
    mediaUrl: "https://images.unsplash.com/photo-1582092723933-263a25b35c02?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["This is not a drill, I saw it on a news website."],
    replies: [
        { author: "Admin", message: "This report has been identified as false. There is NO tsunami warning in effect for Chennai. Please rely on official sources for information.", timestamp: "2025-07-25T11:10:00Z" }
    ],
    status: 'Fake',
    authority: 'Local Police',
  },
  {
    id: 6,
    user: { name: "Aisha", avatarUrl: "https://picsum.photos/id/1027/40/40" },
    timestamp: "2025-07-28T22:00:00Z",
    disasterType: 'Landslide',
    location: { latitude: 31.1048, longitude: 77.1734, name: "Shimla, HP" },
    message: "Landslide on the main highway has blocked the road to the city. We are stranded.",
    mediaUrl: "https://images.unsplash.com/photo-1588618231225-7815b565a7b8?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["The road is completely blocked with debris.", "No alternate routes are open.", "Heavy rains are continuing."],
    replies: [
      { author: "Admin", message: "Road clearance crews are being dispatched. Please stay in a safe location away from the slide area. We will post updates as they come.", timestamp: "2025-07-28T22:15:00Z" }
    ],
    status: 'Under Investigation',
    authority: 'Local Police',
  },
  {
    id: 3,
    user: { name: "Anjali", avatarUrl: "https://picsum.photos/id/239/40/40" },
    timestamp: "2025-07-29T08:00:00Z",
    disasterType: 'Fire',
    location: { latitude: 22.5726, longitude: 88.3639, name: "Kolkata, WB" },
    message: "Large fire at a warehouse near the port. Smoke is heavy in the region.",
    mediaUrl: "https://images.unsplash.com/photo-1561331792-69102434e3a8?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["Air quality is poor. Stay indoors.", "Nearby roads are closed.", "Firefighters are on the scene working to control the blaze."],
    replies: [
        { author: "Admin", message: "Fire crews are on site. We advise residents in the vicinity to keep windows closed and avoid the area to allow emergency vehicles access.", timestamp: "2025-07-29T08:20:00Z" }
    ],
    status: 'Verified',
    authority: 'Fire Dept.',
  },
    {
    id: 4,
    user: { name: "Vikram", avatarUrl: "https://picsum.photos/id/240/40/40" },
    timestamp: "2025-07-28T18:00:00Z",
    disasterType: 'Hurricane',
    location: { latitude: 15.2993, longitude: 74.1240, name: "Goa" },
    message: "Cyclone making landfall. Strong winds and storm surge expected.",
    mediaUrl: "https://images.unsplash.com/photo-1561075104-e34b992f4e41?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["Mandatory evacuations for coastal areas.", "Shelters are open at local schools and community centers.", "Expect widespread power outages."],
    replies: [
        { author: "Admin", message: "This is a severe weather event. Please follow all evacuation orders and tune into local news for the latest updates on shelters and safety measures.", timestamp: "2025-07-28T18:30:00Z" }
    ],
    status: 'Verified',
    authority: 'NDRF',
  },
  {
    id: 7,
    user: { name: "Sameer", avatarUrl: "https://picsum.photos/id/1005/40/40" },
    timestamp: "2025-07-27T11:45:00Z",
    disasterType: 'Power Outage',
    location: { latitude: 26.9124, longitude: 75.7873, name: "Jaipur, RJ" },
    message: "Power has been out for over 12 hours in our area after the dust storm. Any update on restoration?",
    mediaUrl: "https://images.unsplash.com/photo-1580258956422-834c81d739b8?q=80&w=600&h=400&auto=format&fit=crop",
    history: ["The entire neighborhood is dark.", "Phones are running out of battery.", "No official communication from the power company yet."],
    replies: [
        { author: "Admin", message: "Crews are working to restore power. Estimated time for restoration is 8 PM tonight. We apologize for the inconvenience.", timestamp: "2025-07-27T12:00:00Z" }
    ],
    status: 'Under Investigation',
    authority: 'Local Police',
  }
];

export const mockNewsItems: MockNewsItem[] = [
  {
    source: "National Disaster Watch",
    headline: "Cyclone 'Sagar' Expected to Make Landfall on East Coast",
    summary: "Authorities have issued a high alert for coastal regions as Cyclone 'Sagar' is projected to make landfall within the next 48 hours. Evacuation procedures have begun in low-lying areas.",
    timestamp: "2025-09-08T08:00:00Z",
    link: "#",
    category: "Weather Alert",
    categoryType: "alert",
  },
  {
    source: "ABP News",
    headline: "Flash Floods in Uttarakhand Disrupt Kedarnath Yatra",
    summary: "Heavy monsoon rains have triggered flash floods and landslides in several parts of Uttarakhand, leading to a temporary suspension of the Kedarnath Yatra. Rescue teams from NDRF have been deployed.",
    timestamp: "2025-09-08T07:30:00Z",
    link: "#",
    category: "Natural Disaster",
    categoryType: "news",
  },
  {
    source: "GAIL India Ltd.",
    headline: "Preventive Measures Taken for Pipeline Safety Ahead of Monsoon",
    summary: "GAIL has announced the completion of its pre-monsoon pipeline inspection and safety audit. All systems are reported to be secure to prevent any weather-related incidents.",
    timestamp: "2025-09-08T06:45:00Z",
    link: "#",
    category: "Corporate Update",
    categoryType: "corporate",
  },
  {
    source: "News18 India",
    headline: "Minor Tremors Felt in Parts of Delhi-NCR; No Damage Reported",
    summary: "A low-intensity earthquake of magnitude 3.1 was reported late last night. Officials have confirmed that there have been no reports of damage to life or property.",
    timestamp: "2025-09-08T05:00:00Z",
    link: "#",
    category: "Geological Event",
    categoryType: "news",
  },
  {
    source: "Ministry of Power",
    headline: "Grid Stability Maintained During Northern Region Dust Storm",
    summary: "The national power grid remained stable despite the severe dust storm that affected parts of North India yesterday, thanks to proactive load balancing measures.",
    timestamp: "2025-09-07T22:10:00Z",
    link: "#",
    category: "Infrastructure",
    categoryType: "corporate",
  },
  {
    source: "Aaj Tak",
    headline: "Government Announces Relief Package for Flood-Affected Assam",
    summary: "The central government has sanctioned a relief package for the state of Assam, where recent floods have affected millions. The funds will be used for rescue, relief, and rehabilitation efforts.",
    timestamp: "2025-09-07T19:00:00Z",
    link: "#",
    category: "Government Action",
    categoryType: "news",
  },
];


// Helper function to create a new mock update for the live feed simulation
const sampleUsers = [
    { name: "Suresh", avatarId: "1011" },
    { name: "Deepa", avatarId: "1025" },
    { name: "Kiran", avatarId: "10" },
    { name: "Amit", avatarId: "100" },
];

const sampleDisasters = [
    { type: 'Flood', location: { name: "Patna, BR", latitude: 25.5941, longitude: 85.1376 }, message: "River Ganges is overflowing its banks. Water has entered several residential areas.", authority: 'NDRF' as const },
    { type: 'Fire', location: { name: "Bangalore, KA", latitude: 12.9716, longitude: 77.5946 }, message: "A fire has broken out in a factory in the Peenya industrial area. Multiple fire tenders at the spot.", authority: 'Fire Dept.' as const },
    { type: 'Earthquake', location: { name: "Guwahati, AS", latitude: 26.1445, longitude: 91.7362 }, message: "Tremors felt in the city. People are rushing out of their homes. No reports of damage yet.", authority: 'NDRF' as const },
    { type: 'Cyclone', location: { name: "Bhubaneswar, OD", latitude: 20.2961, longitude: 85.8245 }, message: "Cyclone alert issued for the coastal areas. Fishermen are advised not to venture into the sea.", authority: 'NDRF' as const },
];

const sampleImages = [
    'https://images.unsplash.com/photo-1567611295982-84323360742f?q=80&w=600&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549463207-3c973a6a188f?q=80&w=600&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599408013233-a335f6311110?q=80&w=600&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529429402839-a46f6b0b8e73?q=80&w=600&h=400&auto=format&fit=crop',
]

export const createNewMockUpdate = (id: number): DisasterUpdate => {
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const randomDisaster = sampleDisasters[Math.floor(Math.random() * sampleDisasters.length)];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    
    return {
        id,
        user: { name: randomUser.name, avatarUrl: `https://picsum.photos/id/${randomUser.avatarId}/40/40` },
        timestamp: new Date().toISOString(),
        disasterType: randomDisaster.type,
        location: randomDisaster.location,
        message: randomDisaster.message,
        mediaUrl: randomImage,
        history: [randomDisaster.message],
        replies: [],
        status: 'Under Investigation',
        authority: randomDisaster.authority,
    };
};

// Helper function to create a new mock news item
const sampleNewsSources = [
    { source: "National Disaster Watch", category: "Weather Alert", categoryType: "alert" as const },
    { source: "ABP News", category: "Natural Disaster", categoryType: "news" as const },
    { source: "GAIL India Ltd.", category: "Corporate Update", categoryType: "corporate" as const },
    { source: "News18 India", category: "Geological Event", categoryType: "news" as const },
    { source: "Ministry of Power", category: "Infrastructure", categoryType: "corporate" as const },
    { source: "Aaj Tak", category: "Government Action", categoryType: "news" as const },
];

const sampleHeadlines = [
    { headline: "New Cyclone Forming in Bay of Bengal, Coastal Areas on Alert", summary: "A new low-pressure area is developing and is expected to intensify into a cyclonic storm in the next 24 hours. Early warnings have been issued." },
    { headline: "Heatwave Grips North India, Government Issues Advisory", summary: "Temperatures are soaring across northern states, leading to health warnings and advisories to stay indoors during peak hours." },
    { headline: "BSNL Restores Connectivity in Landslide-Hit Regions of Himachal", summary: "State-owned telecom operator BSNL has successfully restored communication lines in several remote areas affected by recent landslides." },
    { headline: "IOCL Ensures Uninterrupted Fuel Supply to Flood-Affected Assam", summary: "Indian Oil Corporation Ltd. has confirmed that its supply chain remains robust, ensuring continuous availability of petroleum products in Assam." },
    { headline: "Minor Tremors Felt in Gujarat, No Damage Reported", summary: "A slight seismic activity was recorded near Kutch, but there have been no reports of casualties or property damage." },
    { headline: "NDMA Conducts Nationwide Earthquake Preparedness Drill", summary: "The National Disaster Management Authority organized a comprehensive drill to test the readiness of emergency response teams across the country." },
];


export const createNewMockNewsItem = (): MockNewsItem => {
    const randomSource = sampleNewsSources[Math.floor(Math.random() * sampleNewsSources.length)];
    const randomHeadline = sampleHeadlines[Math.floor(Math.random() * sampleHeadlines.length)];

    return {
        ...randomSource,
        ...randomHeadline,
        timestamp: new Date().toISOString(),
        link: "#",
    };
};
