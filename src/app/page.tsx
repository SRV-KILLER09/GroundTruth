
import { Button } from "@/components/ui/button";
import { Mountain, LifeBuoy, Users, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-black text-red-500 min-h-screen flex flex-col font-headline">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center bg-black/80 backdrop-blur-sm border-b border-red-900">
        <Link href="#" className="flex items-center justify-center">
          <Mountain className="h-6 w-6 text-red-500" />
          <span className="sr-only">ResQTech</span>
        </Link>
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
          <Link
            href="#about"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-400"
          >
            About Us
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-400"
          >
            Features
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:underline underline-offset-4 text-red-400"
          >
            Contact
          </Link>
          <Button asChild variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
        {/* Mobile Menu Trigger can be added here if needed */}
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
            data-ai-hint="disaster relief team"
          />
          <div className="container px-4 md:px-6 relative z-20">
            <div className="grid gap-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                Coordinating Rescue. Saving Lives.
              </h1>
              <p className="max-w-[600px] text-red-300 md:text-xl mx-auto">
                Your lifeline in times of crisis. Real-time updates, resource coordination, and community support when it matters most.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-red-600 text-white hover:bg-red-700">
                  <Link href="/signup">Join the Network</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-red-900 px-3 py-1 text-sm text-red-300">Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">Strength in Unity</h2>
                <p className="max-w-[900px] text-red-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  In the face of adversity, information and coordination are our most powerful tools. ResQTech is dedicated to bridging the gap between affected communities, rescue teams, and authorities, ensuring a swift, efficient, and unified response to natural disasters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-red-900 px-3 py-1 text-sm text-red-300">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">The Platform for Disaster Response</h2>
              <p className="max-w-[600px] text-red-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Empowering communities and first responders with the tools they need to act decisively.
              </p>
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <Zap className="mt-1 h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Real-Time Community Alerts</h3>
                    <p className="text-red-400">Submit and receive live updates from the ground, keeping everyone informed of the evolving situation.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Emergency Contact Directory</h3>
                    <p className="text-red-400">Instantly access geo-located contact numbers for the nearest police, ambulance, and fire services.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Admin Dispatch System</h3>
                    <p className="text-red-400">Admins can verify reports and dispatch AI-summarized alerts to official authorities for immediate action.</p>
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
              data-ai-hint="emergency response team"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-red-900 bg-gray-900/50">
        <p className="text-xs text-red-400">&copy; 2024 ResQTech. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-red-300">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-red-300">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
