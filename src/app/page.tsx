
import { Button } from "@/components/ui/button";
import { Mountain, LifeBuoy, Users, Zap, ShieldCheck, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function LandingPage() {
  const developers = [
    { name: 'VARDAAN', imageUrl: 'https://picsum.photos/seed/VARDAAN/200' },
    { name: 'SIMRAN', imageUrl: 'https://picsum.photos/seed/SIMRAN/200' },
    { name: 'ADITI', imageUrl: 'https://picsum.photos/seed/ADITI/200' },
    { name: 'SHAMBHAVI', imageUrl: 'https://picsum.photos/seed/SHAMBHAVI/200' },
    { name: 'PULKIT', imageUrl: 'https://picsum.photos/seed/PULKIT/200' },
    { name: 'SARANSH', imageUrl: 'https://picsum.photos/seed/SARANSH/200' },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-headline">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm border-b">
        <Link href="#" className="flex items-center justify-center gap-2">
            <Image src="https://picsum.photos/seed/newlogo/40/40" alt="GroundTruth™ Logo" width={32} height={32} className="rounded-full" data-ai-hint="logo" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">GroundTruth™</span>
            <span className="text-xs text-primary font-semibold">by TitanicX</span>
          </div>
        </Link>
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6 items-center">
           <Button asChild variant="ghost">
                <Link href="#about">About Us</Link>
            </Button>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </nav>
        <div className="ml-auto lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium mt-10">
                <Link href="#about" className="hover:underline underline-offset-4">
                  About Us
                </Link>
                <Button asChild className="mt-4">
                  <Link href="/login">Login</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-48 flex items-center justify-center text-center">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src="https://picsum.photos/1800/900"
            alt="Hero Background"
            fill
            className="object-cover"
            data-ai-hint="disaster relief"
          />
          <div className="container px-4 md:px-6 relative z-20">
            <div className="grid gap-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white drop-shadow-xl [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">
                Coordinating Rescue. Saving Lives.
              </h1>
              <p className="max-w-[600px] text-primary-foreground md:text-xl mx-auto drop-shadow-lg">
                Your lifeline in times of crisis. Real-time updates, resource coordination, and community support when it matters most.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg">
                  <Link href="/signup">Join the Network</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Strength in Unity</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  In the face of adversity, information and coordination are our most powerful tools. TitanicX is dedicated to bridging the gap between affected communities, rescue teams, and authorities, ensuring a swift, efficient, and unified response to natural disasters.
                </p>
              </div>
            </div>
            <Image
              src="https://picsum.photos/800/600"
              width={800}
              height={600}
              alt="Mission Image"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              data-ai-hint="disaster response team"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">The Platform for Disaster Response</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Empowering communities and first responders with the tools they need to act decisively.
              </p>
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <Zap className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold">Real-Time Community Alerts</h3>
                    <p className="text-muted-foreground">Submit and receive live updates from the ground, keeping everyone informed of the evolving situation.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold">Emergency Contact Directory</h3>
                    <p className="text-muted-foreground">Instantly access geo-located contact numbers for the nearest police, ambulance, and fire services.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold">Admin Dispatch System</h3>
                    <p className="text-muted-foreground">Admins can verify reports and dispatch AI-summarized alerts to official authorities for immediate action.</p>
                  </div>
                </li>
              </ul>
            </div>
            <Image
              src="https://picsum.photos/800/600?grayscale"
              width={800}
              height={600}
              alt="Feature Image"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              data-ai-hint="emergency response"
            />
          </div>
        </section>

        {/* Meet the Developers Section */}
        <section id="developers" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">Our Team</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Meet the Developers</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                The passionate minds behind TitanicX, dedicated to using technology for good.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-start gap-6 lg:gap-10 pt-12">
              {developers.map((dev) => (
                <div key={dev.name} className="flex flex-col items-center text-center gap-2">
                  <Image
                    src={dev.imageUrl}
                    alt={`Developer ${dev.name}`}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-primary/50 object-cover"
                    data-ai-hint="person portrait"
                  />
                  <h3 className="text-lg font-bold mt-2">{dev.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="contact" className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground">&copy; 2025 TitanicX. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-primary">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-primary">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
