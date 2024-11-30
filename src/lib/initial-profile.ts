import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateProfileSlug } from "@/lib/profile";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id
    }
  });

  if (profile) {
    return profile;
  }

  const name = `${user.firstName ?? "User"} ${user.lastName ?? user.id.slice(0, 8)}`;
  const slug = await generateProfileSlug(name);

  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name,
      username: `${user.firstName ?? "user"}${user.id.slice(0, 8)}`.toLowerCase(),
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      slug,
    }
  });

  return newProfile;
};