
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Mountain } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Image from "next/image";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export function SignupForm() {
  const { signup, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await signup(values.email, values.password, values.username);
    setIsSubmitting(false); // Only set to false if signup fails, otherwise redirected
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    await signInWithGoogle();
    // Don't set isSubmitting to false, as user will be redirected on success.
  }

  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-white/20 shadow-2xl shadow-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4 gap-3">
            <Image src="https://picsum.photos/seed/newlogo/40/40" alt="GroundTruth™ Logo" width={40} height={40} className="rounded-full" data-ai-hint="logo"/>
            <h1 className="text-4xl font-headline text-primary-foreground">TitanicX</h1>
        </div>
        <CardTitle className="text-3xl font-headline font-bold text-primary-foreground">Create an Account</CardTitle>
        <CardDescription className="text-base font-medium text-primary-foreground/80">Join our community to share and receive disaster updates.</CardDescription>
      </CardHeader>
      <CardContent>
         <Button variant="outline" className="w-full bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={handleGoogleSignIn}>
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 170.8 58.2L325 150.5C300.7 128 276.3 116.5 248 116.5c-70.3 0-127.5 57.2-127.5 127.5s57.2 127.5 127.5 127.5c82.3 0 112.5-52.5 115.8-78.5H248V261.8h239.2z"></path></svg>
          Continue with Google
        </Button>
         <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-foreground/80">Username</FormLabel>
                  <FormControl>
                    <Input className="bg-primary-foreground/5 border-white/20 text-primary-foreground" placeholder="Your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-foreground/80">Email</FormLabel>
                  <FormControl>
                    <Input className="bg-primary-foreground/5 border-white/20 text-primary-foreground" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-foreground/80">Password</FormLabel>
                  <FormControl>
                    <Input className="bg-primary-foreground/5 border-white/20 text-primary-foreground" type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm text-primary-foreground/80">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
