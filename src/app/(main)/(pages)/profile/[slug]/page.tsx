import { getProfileBySlug, getCurrentProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Profile - ${resolvedParams.slug}`,
  }
}
export default async function Page({ 
  params 
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const profile = await getProfileBySlug(resolvedParams.slug);
  const currentUserProfile = await getCurrentProfile();

  if (!profile) {
    redirect("/");
  }

  const isOwnProfile = currentUserProfile?.id === profile.id;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={profile.imageUrl ?? undefined} alt={profile.name ?? ''} />
              <AvatarFallback>{(profile.name ?? '')[0]}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button variant="outline" asChild className="ml-auto">
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {profile.bio && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">About</h2>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
