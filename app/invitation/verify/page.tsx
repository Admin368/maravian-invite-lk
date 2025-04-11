"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError("Invalid token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify token");
        }

        router.push(data.redirectUrl);
      } catch (error) {
        console.error("Verification error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to verify token"
        );
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  bg-opacity-70">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verifying your access</CardTitle>
          <CardDescription className="text-center">
            Please wait while we verify your magic link
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isLoading ? (
            <Loading size="lg" />
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : null}
        </CardContent>
        {error && (
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")}>Return to Login</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
