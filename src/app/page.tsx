"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    const checkProfileAndRedirect = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/profile/${user.id}`);
        const data = await res.json();
        
        if (res.ok) {
          if (data.ikigaiMap) {
            // If user has completed ikigai map, redirect to dashboard
            router.push('/dashboard');
          } else {
            // If user exists but hasn't completed ikigai map
            router.push('/onboarding');
          }
        } else if (res.status === 404) {
          // If profile doesn't exist, redirect to onboarding
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileAndRedirect();
  }, [user, router]);

  // Don't render anything until mounted on client
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">Welcome to Vocassion</CardTitle>
          <CardDescription className="text-lg">
            Discover your perfect career path through personalized guidance and community support
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <SignedIn>
            {isLoading ? (
              <Button disabled>
                Loading...
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={() => router.push('/onboarding')}
              >
                Start Your Journey
              </Button>
            )}
          </SignedIn>
          <SignedOut>
            <Button asChild size="lg">
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </SignedOut>
        </CardContent>
      </Card>
    </div>
  );
}
