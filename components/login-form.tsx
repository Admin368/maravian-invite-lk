"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMagicLink(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        console.log(data.error || "Something went wrong");
        return;
      }

      // If we're in preview mode and have a direct link
      if (data.magicLinkUrl) {
        setMagicLink(data.magicLinkUrl);
        toast.info(
          "Magic link generated for preview. Click the link below to continue."
        );
      } else {
        toast.success("We sent you a magic link to sign in.");
      }

      form.reset();
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send login link"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter your Email</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-black hover:bg-black/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send Access Link"
            )}
          </Button>
        </form>
      </Form>

      {magicLink && (
        <Card className="mt-6 border-gold/20">
          <CardHeader>
            <CardTitle className="text-lg">Preview Mode Magic Link</CardTitle>
            <CardDescription>
              Since you're in preview mode, you can use this direct link instead
              of receiving an email:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="break-all">
                <Link
                  href={magicLink}
                  className="text-blue-600 hover:underline"
                >
                  {magicLink}
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            This link will expire after use, just like a real magic link.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
