
import { Button } from "@/components/ui/button";
import { Mountain, LifeBuoy, Users, Zap, ShieldCheck, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function LandingPage() {
  return (
    <div className="bg-black text-red-400 min-h-screen flex flex-col font-headline">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center bg-black/80 backdrop-blur-sm border-b border-red-900">
        <Link href="#" className="flex items-center justify-center">
          <Mountain className="h-6 w-6 text-red-400" />
          <span className="sr-only">TitanicX</span>
        </Link>
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
          <Link
            href="#about"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-200"
          >
            About Us
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-200"
          >
            Features
          </Link>
          <Link
            href="#developers"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-200"
          >
            Developers
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-200"
          >
            Contact
          </Link>
          <Button asChild variant="outline" className="border-red-400 text-red-300 hover:bg-red-400 hover:text-black">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
        <div className="ml-auto lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-red-300" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-black/90 border-red-900 text-red-200">
              <nav className="grid gap-6 text-lg font-medium mt-10">
                <Link href="#about" className="hover:underline underline-offset-4">
                  About Us
                </Link>
                <Link href="#features" className="hover:underline underline-offset-4">
                  Features
                </Link>
                <Link href="#developers" className="hover:underline underline-offset-4">
                  Developers
                </Link>
                <Link href="#contact" className="hover:underline underline-offset-4">
                  Contact
                </Link>
                <Button asChild variant="outline" className="border-red-400 text-red-300 hover:bg-red-400 hover:text-black mt-4">
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
          <div className="absolute inset-0 bg-black/60 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1599395256384-13a521cf3803?q=80&w=1800&auto=format&fit=crop"
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
              <p className="max-w-[600px] text-red-100 md:text-xl mx-auto drop-shadow-lg">
                Your lifeline in times of crisis. Real-time updates, resource coordination, and community support when it matters most.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-red-500 text-white hover:bg-red-600">
                  <Link href="/signup">Join the Network</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
            <Image
              src="https://images.unsplash.com/photo-1618494720182-563a01594d40?q=80&w=1800&auto=format&fit=crop"
              width={800}
              height={600}
              alt="Mission Image"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              data-ai-hint="disaster response team"
            />
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-red-900 px-3 py-1 text-sm text-red-100">Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">Strength in Unity</h2>
                <p className="max-w-[900px] text-red-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  In the face of adversity, information and coordination are our most powerful tools. TitanicX is dedicated to bridging the gap between affected communities, rescue teams, and authorities, ensuring a swift, efficient, and unified response to natural disasters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-red-900 px-3 py-1 text-sm text-red-100">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">The Platform for Disaster Response</h2>
              <p className="max-w-[600px] text-red-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Empowering communities and first responders with the tools they need to act decisively.
              </p>
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <Zap className="mt-1 h-5 w-5 text-red-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Real-Time Community Alerts</h3>
                    <p className="text-red-200">Submit and receive live updates from the ground, keeping everyone informed of the evolving situation.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 text-red-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Emergency Contact Directory</h3>
                    <p className="text-red-200">Instantly access geo-located contact numbers for the nearest police, ambulance, and fire services.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-red-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Admin Dispatch System</h3>
                    <p className="text-red-200">Admins can verify reports and dispatch AI-summarized alerts to official authorities for immediate action.</p>
                  </div>
                </li>
              </ul>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1542382257-80dedb750703?q=80&w=1800&auto=format&fit=crop"
              width={800}
              height={600}
              alt="Feature Image"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              data-ai-hint="emergency response"
            />
          </div>
        </section>

        {/* Meet the Developers Section */}
        <section id="developers" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-red-900 px-3 py-1 text-sm text-red-100">Our Team</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">Meet the Developers</h2>
              <p className="max-w-[900px] text-red-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                The passionate minds behind TitanicX, dedicated to using technology for good.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-start gap-6 lg:gap-10 pt-12">
              {['VARDAAN', 'SIMRAN', 'ADITI', 'SHAMBHAVI', 'PULKIT', 'SARANSH'].map((name) => (
                <div key={name} className="flex flex-col items-center text-center gap-2">
                  <Image
                    src={`https://picsum.photos/seed/${name}/200`}
                    alt={`Developer ${name}`}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-red-800 object-cover"
                    data-ai-hint="person portrait"
                  />
                  <h3 className="text-lg font-bold text-white mt-2">{name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="contact" className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-red-900 bg-gray-900/50">
        <p className="text-xs text-red-200">&copy; 2025 TitanicX. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-red-100">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-red-100">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
