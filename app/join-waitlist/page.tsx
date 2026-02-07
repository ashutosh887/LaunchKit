"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import config from "@/config";
import { ProjectNameWithBadge } from "@/components/common/ProjectNameWithBadge";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  ventureName: z.string().min(1, "Venture name is required"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export default function WaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      ventureName: "",
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join waitlist");
      }

      setSubmitStatus({
        type: "success",
        message: "Successfully joined the waitlist!",
      });
      form.reset();
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferClick = () => {
    const subject = encodeURIComponent(
      `Check out ${config.projectNameWithVersion} - ${config.projectDescription}`
    );
    const body = encodeURIComponent(
      `Hey! I found this amazing tool called ${config.projectNameWithVersion}. Thought you might be interested!\n\n${config.projectDescription}\n\nCheck it out: ${typeof window !== "undefined" ? window.location.origin : ""}/join-waitlist`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleReportIssue = () => {
    const subject = encodeURIComponent(`Issue Report - ${config.projectNameWithVersion}`);
    const body = encodeURIComponent(
      "Please describe the issue you encountered:\n\n"
    );
    const adminEmail = config.roles.admin[0];
    window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-xl">
          <div className="text-center space-y-5 sm:space-y-7">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-24 h-36 sm:w-32 sm:h-48 md:w-36 md:h-54 flex items-center justify-center mx-auto">
                <Image
                  src="/logo.png"
                  alt={`${config.projectName} Logo`}
                  width={120}
                  height={180}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary flex items-center justify-center gap-2">
                <ProjectNameWithBadge showBadge={false} />
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-primary leading-tight">
                {config.waitlist.heading}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {config.waitlist.subheading}
              </p>
              <div className="flex justify-center">
                <p className="text-xs sm:text-sm md:text-base font-medium text-primary bg-primary/10 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md inline-block max-w-full text-center">
                  {config.waitlist.highlightText}{" "}
                  <span className="font-bold text-primary">
                    {config.waitlist.highlightBold}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 sm:p-6 bg-card shadow-sm mt-5 sm:mt-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        Your email id
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="founder@venture.com"
                          className="h-9 sm:h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ventureName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        Name of your venture
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="My Awesome Startup"
                          className="h-9 sm:h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitStatus && (
                  <div
                    className={`p-2.5 rounded-md text-xs sm:text-sm ${
                      submitStatus.type === "success"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <Button
                    type="submit"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Joining..."
                      : "I'm Ready to Make Money 🚀"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium"
                    onClick={handleReferClick}
                  >
                    I Know Someone Who&apos;ll Love This 👇
                  </Button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleReportIssue}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
                  >
                    Oops encountered an error? Report to us
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
