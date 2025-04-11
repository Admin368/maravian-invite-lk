"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setError("No verification token provided");
          return;
        }

        const response = await fetch(`/api/organizer/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        // Redirect to organizer dashboard on success
        router.push(data.redirectUrl);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
      }
    };

    verifyToken();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500">
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gold">
            <Loading size="lg" />
            <h2 className="text-2xl font-bold">Verifying Organizer Access</h2>
            <p className="text-gray-500">
              Please wait while we verify your credentials...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizerVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gold">
            <Loading size="lg" />
            <h2 className="text-2xl font-bold">Loading...</h2>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
