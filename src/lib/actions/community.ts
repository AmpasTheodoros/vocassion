import { db } from "@/lib/db";

const VALID_POST_TYPES = ["achievement", "challenge", "reflection", "map"] as const;
type PostType = typeof VALID_POST_TYPES[number];

function isValidPostType(type: string): type is PostType {
  return VALID_POST_TYPES.includes(type as PostType);
}

export async function getCommunityPosts() {
  try {
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
        comments: {
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        userLikes: true,
      },
    });

    return posts.map((post) => {
      if (!isValidPostType(post.type)) {
        console.warn(`Invalid post type found: ${post.type}`);
      }
      return {
        id: post.id,
        userId: post.userId,
        title: post.title,
        userName: post.user.name,
        userImage: post.user.imageUrl,
        content: post.content,
        type: (isValidPostType(post.type) ? post.type : "reflection") as PostType,
        likeCount: post.userLikes.length,
        userLikes: post.userLikes,
        comments: post.comments,
        createdAt: post.createdAt,
      };
    });
  } catch (error) {
    console.error("[GET_COMMUNITY_POSTS]", error);
    throw new Error("Failed to fetch community posts");
  }
}

export async function createCommunityPost(
  userId: string,
  data: {
    title: string;
    content: string;
    type: string;
    communityId: string;
  }
) {
  try {
    if (!isValidPostType(data.type)) {
      throw new Error(`Invalid post type: ${data.type}`);
    }

    const post = await db.communityPost.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        type: data.type as PostType,
        communityId: data.communityId,
      },
    });

    // Award points for contribution
    await db.reward.create({
      data: {
        userId,
        points: 5,
        description: "Community post creation",
      },
    });

    return post;
  } catch (error) {
    console.error("[CREATE_COMMUNITY_POST]", error);
    throw new Error("Failed to create community post");
  }
}

export async function togglePostLike(postId: string, userId: string) {
  try {
    const existingLike = await db.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await db.communityPostLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      await db.communityPost.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return { liked: false };
    } else {
      await db.communityPostLike.create({
        data: {
          postId,
          userId,
        },
      });

      await db.communityPost.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return { liked: true };
    }
  } catch (error) {
    console.error("[TOGGLE_POST_LIKE]", error);
    throw new Error("Failed to toggle post like");
  }
}

export async function addComment(
  postId: string,
  userId: string,
  content: string
) {
  try {
    const comment = await db.comment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // Award points for contribution
    await db.reward.create({
      data: {
        userId,
        points: 2,
        description: "Community comment",
      },
    });

    return comment;
  } catch (error) {
    console.error("[ADD_COMMENT]", error);
    throw new Error("Failed to add comment");
  }
}
