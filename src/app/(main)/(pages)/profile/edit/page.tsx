import { getCurrentProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export const metadata = {
  title: "Edit Profile - ComeKomsu",
};

export default async function EditProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="h-full p-4 pt-20 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <ProfileEditor profile={profile} />
      </div>
    </div>
  );
}
