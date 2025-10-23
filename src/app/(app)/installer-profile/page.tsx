"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  serviceLocations: z.string().min(3, "Service locations are required."),
  companyDescription: z.string().optional(),
  pricingDetails: z.string().min(2, "Pricing details are required (e.g., $, $$, $$$)."),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function InstallerProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const { data: userData, loading: docLoading } = useDoc<any>(firestore, 'users', user?.uid || '');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: "",
      serviceLocations: "",
      companyDescription: "",
      pricingDetails: "",
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        companyName: userData.companyName || "",
        serviceLocations: userData.serviceLocations || "",
        companyDescription: userData.companyDescription || "",
        pricingDetails: userData.pricingDetails || "",
        latitude: userData.latitude,
        longitude: userData.longitude
      });
    }
  }, [userData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in." });
      return;
    }

    try {
      const userRef = doc(firestore!, 'users', user.uid);
      const locationData = {
          latitude: 34.0522 + (Math.random() - 0.5) * 0.1,
          longitude: -118.2437 + (Math.random() - 0.5) * 0.1,
      };

      await setDoc(userRef, { ...data, ...locationData }, { merge: true });
      toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };

  if (userLoading || docLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Installer Profile</CardTitle>
            <CardDescription>
              Fill out your company's information to be listed and found by homeowners.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Solaris Experts" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceLocations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Locations</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Los Angeles, San Diego, Orange County" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricingDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Details</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $$ - Competitive" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell homeowners about your company, your experience, and what makes you stand out."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2" />}
                  Save Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    