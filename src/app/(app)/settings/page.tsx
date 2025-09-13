"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/lib/hooks/use-settings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/page-header";

const settingsSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  logoUrl: z.string().url().or(z.literal("")),
  contactDetails: z.string().email("Please enter a valid email."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

import Link from "next/link";

export default function SettingsPage() {
  const { settings, saveSettings } = useSettings();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (data: SettingsFormValues) => {
    saveSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied.",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header row with breadcrumb for settings */}
      <div className="flex flex-col gap-2  bg-[#1976D2] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        </div>
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:underline text-white pl-4">Home</Link>
              <span className="mx-2 text-white">/</span>
            </li>
            <li className="font-medium text-white">Settings</li>
          </ol>
        </nav>
        <p className="text-blue-100 mt-1 pl-4">Customize application details.</p>
      </div>
      <Card className="max-w-2xl ml-4" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Update your company name, logo and contact information.</CardDescription>
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
                      <Input placeholder="CRT Reports Dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (mock)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://placehold.co/100x100.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@crtdashboard.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
