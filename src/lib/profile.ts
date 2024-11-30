import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const getProfileBySlug = async (slug: string) => {
  try {
    const profile = await db.profile.findUnique({
      where: { slug },
    });

    return profile;
  } catch {
    return null;
  }
};

export const getCurrentProfile = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    return profile;
  } catch {
    return null;
  }
};

export const generateProfileSlug = async (name: string) => {
  // Convert to lowercase and remove special characters
  const baseSlug = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9-]/g, '-') // Replace special chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  const slug = baseSlug;
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  // First try without a number
  const existingProfile = await db.profile.findUnique({
    where: { slug },
  });

  if (!existingProfile) {
    return slug;
  }

  // If exists, add the random suffix
  return `${baseSlug}-${randomSuffix}`;
};
