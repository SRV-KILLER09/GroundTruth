
import type { Language } from "@/contexts/LanguageContext";

type Translations = {
    [key: string]: {
        [lang in Language]: string;
    }
};

export const translations: Translations = {
    liveFeed: {
        en: "Live Feed",
        hi: "लाइव फीड",
        bn: "লাইভ ফিড"
    },
    communityChat: {
        en: "Community Chat",
        hi: "सामुदायिक चैट",
        bn: "কমিউনিটি চ্যাট"
    },
    notifications: {
        en: "Notifications",
        hi: "सूचनाएं",
        bn: "বিজ্ঞপ্তি"
    },
    mapView: {
        en: "Map View",
        hi: "मानचित्र देखें",
        bn: "মানচিত্র দেখুন"
    },
    reports: {
        en: "Reports",
        hi: "रिपोर्ट",
        bn: "রিপোর্ট"
    },
    news: {
        en: "News",
        hi: "समाचार",
        bn: "খবর"
    },
    directory: {
        en: "Directory",
        hi: "निर्देशिका",
        bn: "ডিরেক্টরি"
    },
    userActivity: {
        en: "User Activity",
        hi: "उपयोगकर्ता गतिविधि",
        bn: "ব্যবহারকারী কার্যকলাপ"
    },
    broadcast: {
        en: "Broadcast",
        hi: "प्रसारण",
        bn: "সম্প্রচার"
    },
    adminPanel: {
        en: "Admin Panel",
        hi: "एडमिन पैनल",
        bn: "অ্যাডমিন প্যানেল"
    },
    safetyResources: {
        en: "Safety Resources",
        hi: "सुरक्षा संसाधन",
        bn: "নিরাপত্তা সম্পদ"
    },
    aboutUs: {
        en: "About Us",
        hi: "हमारे बारे में",
        bn: "আমাদের সম্পর্কে"
    },
};

export type TranslationKey = keyof typeof translations;
