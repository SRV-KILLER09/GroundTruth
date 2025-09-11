
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Priya Sharma",
    username: "@priya_sharma",
    imageUrl: "https://picsum.photos/seed/priya/100",
    testimonial: "TitanicX was a lifeline during the Mumbai floods. The live updates helped my family navigate to a safer area. Incredibly grateful for this platform.",
  },
  {
    name: "Rohan Kumar",
    username: "@rohan_k",
    imageUrl: "https://picsum.photos/seed/rohan/100",
    testimonial: "As a first responder, getting verified, real-time information is critical. This app cut through the noise and helped us act faster. A game-changer.",
  },
  {
    name: "Anjali Das",
    username: "@anjali_d",
    imageUrl: "https://picsum.photos/seed/anjali/100",
    testimonial: "The community chat feature was amazing. We were able to coordinate with our neighbors and share resources effectively during the cyclone warning.",
  },
  {
    name: "Vikram Singh",
    username: "@vikram_s",
    imageUrl: "https://picsum.photos/seed/vikram/100",
    testimonial: "I reported a fallen tree blocking a road, and within hours, authorities had cleared it. It's empowering to know your report makes a difference.",
  },
  {
    name: "Aisha Khan",
    username: "@aisha_khan",
    imageUrl: "https://picsum.photos/seed/aisha/100",
    testimonial: "The safety resources section is so well-prepared. It gave me a clear checklist to follow when the earthquake tremors started. Felt much more prepared.",
  },
  {
    name: "Sameer Verma",
    username: "@sameer_v",
    imageUrl: "https://picsum.photos/seed/sameer/100",
    testimonial: "I was stranded and the map view helped my friend locate me. The accuracy is incredible. Thank you, TitanicX team!",
  },
  {
    name: "Neha Gupta",
    username: "@neha_g",
    imageUrl: "https://picsum.photos/seed/neha/100",
    testimonial: "The AI-summarized alerts are brilliant. They provide clear, concise information that's easy to understand in a panic.",
  },
  {
    name: "Arjun Reddy",
    username: "@arjun_reddy",
    imageUrl: "https://picsum.photos/seed/arjun/100",
    testimonial: "This platform connects communities like nothing else. Seeing everyone come together to help each other was truly inspiring.",
  },
   {
    name: "Isha Malhotra",
    username: "@isha_m",
    imageUrl: "https://picsum.photos/seed/isha/100",
    testimonial: "The emergency directory is an essential feature. I quickly found the number for the local fire station during a small incident in my building.",
  },
  {
    name: "Karan Joshi",
    username: "@karan_j",
    imageUrl: "https://picsum.photos/seed/karan/100",
    testimonial: "The admin team's notifications kept us informed with reliable news, which is crucial when there's so much misinformation spreading online.",
  },
  {
    name: "Meera Nair",
    username: "@meera_n",
    imageUrl: "https://picsum.photos/seed/meera/100",
    testimonial: "A must-have app for every household in India. It's not just an app; it's a safety net for the entire community. Highly recommended.",
  },
  {
    name: "Siddharth Rao",
    username: "@sid_rao",
    imageUrl: "https://picsum.photos/seed/sid/100",
    testimonial: "Simple, effective, and potentially life-saving. The user interface is intuitive, which is exactly what you need in a crisis. Great work by the developers.",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline">
            <Quote className="mr-3 h-8 w-8 text-primary" />
            Voices from the Community
          </CardTitle>
          <CardDescription>
            Hear what our users have to say about their experience with TitanicX.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="flex flex-col justify-between bg-muted/50 border-primary/20 shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Quote className="h-10 w-10 text-primary/30 flex-shrink-0 -mt-2" />
                    <p className="text-foreground/90 italic">
                      "{testimonial.testimonial}"
                    </p>
                  </div>
                </CardContent>
                <CardHeader className="p-6 pt-4 mt-auto bg-muted/20 border-t border-primary/20">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.username}</p>
                        </div>
                    </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
