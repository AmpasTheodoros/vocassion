"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading] = useState(false);
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted on client
  if (!mounted) {
    return null;
  }

  const getProfileSlug = () => {
    if (!user?.firstName || !user?.lastName) return user?.id;
    const name = `${user.firstName} ${user.lastName}`;
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold">Welcome to Vocassion</h1>
        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Your profile: {getProfileSlug()}
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push(`/profile/${getProfileSlug()}`)}
            >
              {isLoading ? "Loading..." : "Go to My Profile"}
            </Button>
          </div>
        </SignedIn>
        <SignedOut>
          <Button asChild size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </SignedOut>
        <UserButton/>
      </div>
    </div>
  );
}
