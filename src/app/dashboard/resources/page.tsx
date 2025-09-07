
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoy, Zap, Droplets, Flame, Wind, ShieldCheck } from "lucide-react";

export default function SafetyResourcesPage() {
  const resources = [
    {
      title: "General Emergency Preparedness",
      icon: <ShieldCheck className="h-5 w-5 mr-3 text-primary" />,
      content: "Have an emergency kit with water, non-perishable food, a flashlight, batteries, a first-aid kit, and a whistle. Make a family communications plan. Know your evacuation routes.",
    },
    {
      title: "Earthquake Safety",
      icon: <Zap className="h-5 w-5 mr-3 text-yellow-500" />,
      content: "During an earthquake: Drop, Cover, and Hold On. Stay indoors until the shaking stops. Stay away from windows. If outdoors, find a clear spot away from buildings and trees.",
    },
    {
      title: "Flood Safety",
      icon: <Droplets className="h-5 w-5 mr-3 text-blue-500" />,
      content: "Evacuate immediately if told to do so. Never walk, swim, or drive through floodwaters. Turn Around, Don't Drown! Stay off bridges over fast-moving water.",
    },
    {
      title: "Fire Safety",
      icon: <Flame className="h-5 w-5 mr-3 text-orange-500" />,
      content: "Install smoke alarms on every level of your home. Test them monthly. Know at least two ways out of every room. Have a meeting place outside.",
    },
    {
      title: "Hurricane Safety",
      icon: <Wind className="h-5 w-5 mr-3 text-gray-500" />,
      content: "Prepare by covering windows with storm shutters or plywood. Bring loose, lightweight objects inside. Listen to authorities for evacuation orders. Be ready for power outages.",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LifeBuoy className="mr-2 h-6 w-6 text-primary" />
            Safety Resources & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Knowledge is your best defense in an emergency. Review these safety tips to prepare for various disaster scenarios.
          </p>
          <Accordion type="single" collapsible className="w-full">
            {resources.map((resource, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center">
                    {resource.icon}
                    {resource.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-8">
                  {resource.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
