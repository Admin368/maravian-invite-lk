"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const formSchema = z.object({
  status: z.enum(["attending", "not_attending"]),
  plusOne: z.boolean(),
  plusOneName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type RsvpFormProps = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  existingRsvp?: {
    status: string;
    plus_one: boolean;
    plus_one_name: string | null;
  } | null;
  redirectOnSuccess?: boolean;
};

export function RsvpForm({
  user,
  existingRsvp,
  redirectOnSuccess = false,
}: RsvpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status:
        (existingRsvp?.status as "attending" | "not_attending") || "attending",
      plusOne: existingRsvp?.plus_one || false,
      plusOneName: existingRsvp?.plus_one_name || "",
    },
  });

  const watchStatus = form.watch("status");
  const watchPlusOne = form.watch("plusOne");

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          status: values.status,
          plusOne: values.plusOne,
          plusOneName: values.plusOne ? values.plusOneName : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit RSVP");
      }

      toast.success("Thank you for your response!");

      if (redirectOnSuccess) {
        router.push("/invitation");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("RSVP error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit RSVP"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-gold/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">RSVP</CardTitle>
        <CardDescription>
          Please let us know if you can attend the celebration for Layla &
          Kondwani
        </CardDescription>
        <CardDescription>
          Date: Wednesday 16th April 2025, Time: 5pm, more details on the next
          page
        </CardDescription>
        <CardDescription className="text-red-500">
          This is a surprise proposal! Please DO NOT share or discuss any
          details about the date and time with the bride - she is expecting this
          event to happen on a different date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Will you be attending?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="attending" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Yes, I will attend
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="not_attending" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          No, I cannot attend
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchStatus === "attending" && (
              <>
                <FormField
                  control={form.control}
                  name="plusOne"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Bringing a Plus One?
                        </FormLabel>
                        <FormDescription>
                          Let us know if you'll be bringing a guest
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchPlusOne && (
                  <FormField
                    control={form.control}
                    name="plusOneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest's Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your guest's name"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit RSVP"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
