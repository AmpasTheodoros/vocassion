import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request
) {
  try {
    const user = await currentUser();
    const userId = user?.id;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate a unique username and slug
    const baseUsername = values.name.toLowerCase().replace(/\s+/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const username = `${baseUsername}${uniqueId}`;
    const slug = username;

    // Create profile
    const profile = await db.profile.create({
      data: {
        userId,
        username,
        slug,
        name: values.name,
        imageUrl: values.imageUrl,
        email: values.email,
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_POST] Error details:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse("Profile already exists", { status: 409 });
      }
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    console.error("[PROFILE_PATCH] Error details:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse("Profile already exists", { status: 409 });
      }
      if (error.code === 'P2025') {
        return new NextResponse("Profile not found", { status: 404 });
      }
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}
