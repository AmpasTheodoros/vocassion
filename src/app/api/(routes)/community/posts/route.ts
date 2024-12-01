import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const posts = await db.communityPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        userLikes: true,
        comments: true,
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      userName: post.user.name,
      userImage: post.user.imageUrl,
      content: post.content,
      likes: post.userLikes.length,
      comments: post.comments.length,
      createdAt: post.createdAt,
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("[COMMUNITY_POSTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id || !auth.profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, title, communityId } = await req.json();
    const userId = auth.profile.id;

    if (!userId || !content || !title || !communityId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const post = await db.communityPost.create({
      data: {
        userId,
        content,
        title,
        communityId,
      },
    });

    // Award points for contribution
    await db.reward.create({
      data: {
        userId,
        points: 10,
        description: "Community contribution",
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[COMMUNITY_POSTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
