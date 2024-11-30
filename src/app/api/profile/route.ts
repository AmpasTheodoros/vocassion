import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request
) {
  try {
    const user = await currentUser()
    const userId = user?.id
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.update({
      where: {
        userId
      },
      data: {
        name: values.name,
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
