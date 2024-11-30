import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getAuthUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    const profile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    return {
      user,
      profile,
    };
  } catch (error) {
    console.error("[AUTH_ERROR]", error);
    return null;
  }
}
