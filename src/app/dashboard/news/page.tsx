import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss, Newspaper, Building, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const mockNewsItems = [
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

const categoryStyles = {
    alert: "bg-red-500/10 text-red-500 border-red-500/20",
    news: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    corporate: "bg-green-500/10 text-green-500 border-green-500/20"
}

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rss className="mr-2 h-6 w-6 text-primary" />
                National News Feed
              </CardTitle>
              <CardDescription>
                A simulated feed of the latest disaster-related news from trusted national sources and PSUs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockNewsItems.map((item, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.categoryType === 'corporate' ? <Building className="h-4 w-4" /> : <Newspaper className="h-4 w-4" />}
                            <span>{item.source}</span>
                        </div>
                        <Badge variant="outline" className={categoryStyles[item.categoryType as keyof typeof categoryStyles]}>
                            {item.categoryType === 'alert' && <TriangleAlert className="h-3 w-3 mr-1.5" />}
                            {item.category}
                        </Badge>
                    </div>
                    <h3 className="text-xl font-headline font-semibold mb-2 text-foreground">
                      <Link href={item.link} className="hover:text-primary transition-colors">
                        {item.headline}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {item.summary}
                    </p>
                    <div className="text-xs text-muted-foreground/80">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
             <CardFooter className="text-center text-muted-foreground text-sm">
                <p>This is a simulated news feed for demonstration purposes.</p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
