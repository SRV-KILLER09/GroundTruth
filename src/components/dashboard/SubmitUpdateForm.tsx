"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { DisasterUpdate } from "@/lib/mock-data";

const formSchema = z.object({
  disasterType: z.enum(['Flood', 'Earthquake', 'Fire', 'Hurricane']),
  locationName: z.string().min(1, { message: "Location is required." }),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  message: z.string().min(10, { message: "Update message must be at least 10 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitUpdateFormProps {
    onSubmit: (data: Omit<DisasterUpdate, 'id' | 'timestamp'>) => void;
}

export function SubmitUpdateForm({ onSubmit }: SubmitUpdateFormProps) {
  const { user } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disasterType: 'Flood',
      locationName: "",
      latitude: 0,
      longitude: 0,
      message: "",
    },
  });

  function handleFormSubmit(values: FormValues) {
    if (!user) return;

    const newUpdate = {
        user: {
            name: user.username,
            avatarUrl: `https://picsum.photos/seed/${user.email}/40/40`
        },
        disasterType: values.disasterType,
        location: {
            name: values.locationName,
            latitude: values.latitude,
            longitude: values.longitude
        },
        message: values.message,
        updates: [values.message] // Initial update
    };
    
    onSubmit(newUpdate);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-6">
        <FormField
          control={form.control}
          name="disasterType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disaster Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a disaster type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Flood">Flood</SelectItem>
                  <SelectItem value="Earthquake">Earthquake</SelectItem>
                  <SelectItem value="Fire">Fire</SelectItem>
                  <SelectItem value="Hurricane">Hurricane</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="locationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Downtown, City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="34.0522" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="-118.2437" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Update Message</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Provide a detailed update on the situation..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Submit Update</Button>
      </form>
    </Form>
  );
}
