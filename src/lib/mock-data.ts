
export type DisasterUpdateReply = {
  author: string;
  message: string;
  timestamp: string;
};

export type DisasterStatus = 'Verified' | 'Under Investigation' | 'Fake';

export type UserProfile = {
  name: string;
  username: string;
  avatarUrl: string;
};

export type DisasterUpdate = {
  id?: string; // Firestore document ID is a string
  user: UserProfile;
  timestamp: string;
  disasterType: 'Flood' | 'Earthquake' | 'Fire' | 'Hurricane' | string; // Allow custom strings
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  message: string;
  mediaUrl?: string | null;
  history: string[];
  replies: DisasterUpdateReply[];
  status: DisasterStatus;
  authority: 'NDRF' | 'Local Police' | 'Fire Dept.' | 'Medical Team';
  likedBy?: string[];
  dislikedBy?: string[];
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

export type UserActivity = {
  id: string;
  email: string;
  username: string;
  location: string;
  creationTime: string;
  honorScore: number;
  status: 'Registered' | 'Logged In';
};

export const mockUserActivity: UserActivity[] = [
    { id: "u1a", email: "priya@example.com", username: "Priya", location: "Mumbai, MH", creationTime: "2025-07-29T12:05:00Z", honorScore: 100, status: "Logged In" },
    { id: "u7", email: "neha@example.com", username: "Neha", location: "Bengaluru, KA", creationTime: "2025-07-29T11:00:00Z", honorScore: 100, status: "Registered" },
    { id: "u1b", email: "priya@example.com", username: "Priya", location: "Mumbai, MH", creationTime: "2025-07-29T09:00:00Z", honorScore: 100, status: "Registered" },
    { id: "u2", email: "rohan@example.com", username: "Rohan", location: "Chennai, TN", creationTime: "2025-07-29T08:30:00Z", honorScore: 99, status: "Logged In" },
    { id: "u3", email: "anjali@example.com", username: "Anjali", location: "Kolkata, WB", creationTime: "2025-07-29T07:00:00Z", honorScore: 100, status: "Logged In" },
    { id: "u5", email: "aisha@example.com", username: "Aisha", location: "Shimla, HP", creationTime: "2025-07-28T21:00:00Z", honorScore: 100, status: "Registered" },
    { id: "u4", email: "vikram@example.com", username: "Vikram", location: "Goa", creationTime: "2025-07-28T17:00:00Z", honorScore: 98, status: "Logged In" },
    { id: "u6a", email: "sameer@example.com", username: "Sameer", location: "Jaipur, RJ", creationTime: "2025-07-28T14:15:00Z", honorScore: 100, status: "Logged In" },
    { id: "u2b", email: "rohan@example.com", username: "Rohan", location: "Chennai, TN", creationTime: "2025-07-28T11:20:00Z", honorScore: 99, status: "Logged In" },
    { id: "u6b", email: "sameer@example.com", username: "Sameer", location: "Jaipur, RJ", creationTime: "2025-07-27T10:45:00Z", honorScore: 100, status: "Registered" },
    { id: "u3b", email: "anjali@example.com", username: "Anjali", location: "Kolkata, WB", creationTime: "2025-07-27T09:05:00Z", honorScore: 100, status: "Registered" },
    { id: "u2c", email: "rohan@example.com", username: "Rohan", location: "Chennai, TN", creationTime: "2025-07-27T08:00:00Z", honorScore: 99, status: "Registered" },
    { id: "u4b", email: "vikram@example.com", username: "Vikram", location: "Goa", creationTime: "2025-07-26T18:30:00Z", honorScore: 98, status: "Registered" },
];


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
