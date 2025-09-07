
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mountain, LifeBuoy, Users, Zap, ShieldCheck, Home as HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardHomePage() {
  const developers = [
    { name: 'VARDAAN', imageUrl: 'https://picsum.photos/seed/VARDAAN/200' },
    { name: 'SIMRAN', imageUrl: 'https://picsum.photos/seed/SIMRAN/200' },
    { name: 'ADITI', imageUrl: 'https://picsum.photos/seed/ADITI/200' },
    { name: 'SHAMBHAVI', imageUrl: 'https://picsum.photos/seed/SHAMBHAVI/200' },
    { name: 'PULKIT', imageUrl: 'https://picsum.photos/seed/PULKIT/200' },
    { name: 'SARANSH', imageUrl: 'https://picsum.photos/seed/SARANSH/200' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline">
            <HomeIcon className="mr-3 h-8 w-8 text-primary" />
            Welcome to GroundTruth
          </CardTitle>
        </CardHeader>
      </Card>

      {/* About Us Section */}
      <Card id="about">
        <CardHeader>
          <CardTitle>About Us: Strength in Unity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
                <p className="text-muted-foreground text-lg">
                In the face of adversity, information and coordination are our most powerful tools. TitanicX is dedicated to bridging the gap between affected communities, rescue teams, and authorities, ensuring a swift, efficient, and unified response to natural disasters.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard">Go to Live Feed</Link>
                </Button>
            </div>
          <Image
            src="https://picsum.photos/800/600"
            width={800}
            height={600}
            alt="Mission Image"
            className="rounded-xl object-cover object-center"
            data-ai-hint="disaster response team"
          />
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card id="features">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-6">
                <li className="flex items-start gap-4">
                    <Zap className="mt-1 h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold">Real-Time Community Alerts</h3>
                        <p className="text-muted-foreground">Submit and receive live updates from the ground, keeping everyone informed of the evolving situation.</p>
                    </div>
                </li>
                <li className="flex items-start gap-4">
                    <Users className="mt-1 h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold">Emergency Contact Directory</h3>
                        <p className="text-muted-foreground">Instantly access geo-located contact numbers for the nearest police, ambulance, and fire services.</p>
                    </div>
                </li>
                <li className="flex items-start gap-4">
                    <ShieldCheck className="mt-1 h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold">Admin Dispatch System</h3>
                        <p className="text-muted-foreground">Admins can verify reports and dispatch AI-summarized alerts to official authorities for immediate action.</p>
                    </div>
                </li>
            </ul>
        </CardContent>
      </Card>

      {/* Developers Section */}
      <Card id="developers">
        <CardHeader>
          <CardTitle className="text-center">Meet the Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl mx-auto text-center text-muted-foreground mb-8">
            The passionate minds behind TitanicX, dedicated to using technology for good.
          </p>
          <div className="mx-auto grid max-w-4xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-start gap-6 lg:gap-8">
            {developers.map((dev) => (
              <div key={dev.name} className="flex flex-col items-center text-center gap-2">
                <Image
                  src={dev.imageUrl}
                  alt={`Developer ${dev.name}`}
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-primary/50 object-cover"
                  data-ai-hint="person portrait"
                />
                <h3 className="text-md font-bold mt-2">{dev.name}</h3>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card id="contact">
        <CardHeader>
          <CardTitle>Contact & Information</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">&copy; 2025 TitanicX. All rights reserved.</p>
          <nav className="flex justify-center gap-4 sm:gap-6 mt-4">
            <Link href="#" className="text-sm hover:underline underline-offset-4 text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4 text-primary">
              Privacy
            </Link>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
