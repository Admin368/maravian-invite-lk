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
import { Loader2, CheckCircle2, Mail } from "lucide-react";
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
import { Loading } from "./ui/loading";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function LoginForm({ redirect }: { redirect?: string | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMagicLink(null);
    setSentEmail(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, redirect }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        console.log(data.error || "Something went wrong");
        return;
      }

      setSentEmail(values.email);

      // If we're in preview mode and have a direct link
      if (data.magicLinkUrl) {
        setMagicLink(data.magicLinkUrl);
        toast.info(
          "Preview access link generated. Click the link below to continue."
        );
      } else {
        toast.success("Access link sent to your email!");
      }

      form.reset();
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send access link"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {!sentEmail ? (
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
                  <Loading size="lg" />
                  Sending access link...
                </>
              ) : (
                "Send Access Link"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle className="text-lg text-green-800">
                Access Link Sent!
              </CardTitle>
            </div>
            <CardDescription className="text-green-700">
              We've sent an access link to {sentEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
              <Mail className="mt-1 h-5 w-5 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Check your email</p>
                <p className="text-sm text-gray-500">
                  Click the link in your email to access your account. The link
                  will expire after use.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSentEmail(null)}
            >
              Send another link
            </Button>
          </CardFooter>
        </Card>
      )}

      {magicLink && (
        <Card className="mt-6 border-gold/20">
          <CardHeader>
            <CardTitle className="text-lg">Preview Mode Access Link</CardTitle>
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
            This link will expire after use, just like a real access link.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
