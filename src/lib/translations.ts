
import type { Language } from "@/contexts/LanguageContext";

type Translations = {
    [key: string]: {
        [lang in Language]?: string;
    }
};

export const translations: Translations = {
    liveFeed: {
        en: "Live Feed",
        hi: "लाइव फीड",
        bn: "লাইভ ফিড",
        ta: "நேரடி ஊட்டம்",
        te: "ప్రత్యక్ష ప్రసారం",
        mr: "थेट फीड",
        pa: "ਲਾਈਵ ਫੀਡ"
    },
    communityChat: {
        en: "Community Chat",
        hi: "सामुदायिक चैट",
        bn: "কমিউনিটি চ্যাট",
        ta: "சமூக அரட்டை",
        te: "సంఘం చాట్",
        mr: "समुदाय गप्पा",
        pa: "ਕਮਿਊਨਿਟੀ ਚੈਟ"
    },
    aiHelpDesk: {
        en: "AI HelpDesk",
        hi: "एआई हेल्पडेस्क",
        bn: "এআই হেল্পডেস্ক",
        ta: "AI உதவி மையம்",
        te: "AI సహాయ కేంద్రం",
        mr: "एआय हेल्पडेस्क",
        pa: "AI ਹੈਲਪਡੈਸਕ"
    },
    directMessages: {
        en: "Direct Messages",
        hi: "डायरेक्ट मैसेज",
        bn: "সরাসরি বার্তা",
        ta: "நேரடி செய்திகள்",
        te: "ప్రత్యక్ష సందేశాలు",
        mr: "थेट संदेश",
        pa: "ਸਿੱਧੇ ਸੁਨੇਹੇ"
    },
    notifications: {
        en: "Notifications",
        hi: "सूचनाएं",
        bn: "বিজ্ঞপ্তি",
        ta: "அறிவிப்புகள்",
        te: "ప్రకటనలు",
        mr: "सूचना",
        pa: "ਸੂਚਨਾਵਾਂ"
    },
    mapView: {
        en: "Map View",
        hi: "मानचित्र देखें",
        bn: "মানচিত্র দেখুন",
        ta: "வரைபடக் காட்சி",
        te: "మ్యాప్ వీక్షణ",
        mr: " नकाशा दृश्य",
        pa: "ਨਕਸ਼ਾ ਦ੍ਰਿਸ਼"
    },
    reports: {
        en: "Reports",
        hi: "रिपोर्ट",
        bn: "রিপোর্ট",
        ta: "அறிக்கைகள்",
        te: "నివేదికలు",
        mr: "अहवाल",
        pa: "ਰਿਪੋਰਟਾਂ"
    },
    news: {
        en: "News",
        hi: "समाचार",
        bn: "খবর",
        ta: "செய்திகள்",
        te: "వార్తలు",
        mr: "बातम्या",
        pa: "ਖ਼ਬਰਾਂ"
    },
    directory: {
        en: "Directory",
        hi: "निर्देशिका",
        bn: "ডিরেক্টরি",
        ta: "டைரக்டரி",
        te: "డైరెక్టరీ",
        mr: "निर्देशिका",
        pa: "ਡਾਇਰੈਕਟਰੀ"
    },
    userActivity: {
        en: "User Activity",
        hi: "उपयोगकर्ता गतिविधि",
        bn: "ব্যবহারকারী কার্যকলাপ",
        ta: "பயனர் செயல்பாடு",
        te: "వినియోగదారు కార్యాచరణ",
        mr: "वापरकर्ता क्रियाकलाप",
        pa: "ਉਪਭੋਗਤਾ ਗਤੀਵਿਧੀ"
    },
    broadcast: {
        en: "Broadcast",
        hi: "प्रसारण",
        bn: "সম্প্রচার",
        ta: "ஒளிபரப்பு",
        te: "ప్రసారం",
        mr: "प्रसारण",
        pa: "ਪ੍ਰਸਾਰਣ"
    },
    safetyResources: {
        en: "Safety Resources",
        hi: "सुरक्षा संसाधन",
        bn: "নিরাপত্তা সম্পদ",
        ta: "பாதுகாப்பு வளங்கள்",
        te: "భద్రతా వనరులు",
        mr: "सुरक्षितता संसाधने",
        pa: "ਸੁਰੱਖਿਆ ਸਰੋਤ"
    },
    testimonials: {
        en: "Testimonials",
        hi: "प्रशंसापत्र",
        bn: "প্রশংসাপত্র",
        ta: "சான்றுகள்",
        te: "సాక్ష్యాలు",
        mr: "अभिप्राय",
        pa: "ਪ੍ਰਸੰਸਾ ਪੱਤਰ"
    },
    aboutUs: {
        en: "About Us",
        hi: "हमारे बारे में",
        bn: "আমাদের সম্পর্কে",
        ta: "எங்களை பற்றி",
        te: "మా గురించి",
        mr: "आमच्याबद्दल",
        pa: "ਸਾਡੇ ਬਾਰੇ"
    },
};

export type TranslationKey = keyof typeof translations;
