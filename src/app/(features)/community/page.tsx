import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CommunityHub } from "@/components/community/CommunityHub";

export default async function CommunityPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Community Hub</h1>
      <CommunityHub />
    </div>
  );
}
