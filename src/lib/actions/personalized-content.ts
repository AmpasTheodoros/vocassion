import { db } from "@/lib/db";
import type { Resource, Story, MiniGame } from "@prisma/client";

export async function getPersonalizedResources(userId: string): Promise<Resource[]> {
  // Get user's Ikigai map
  const ikigaiMap = await db.ikigaiMap.findUnique({
    where: { userId }
  });

  if (!ikigaiMap) return [];

  // Combine all Ikigai areas for matching
  const relevantAreas = [
    ...ikigaiMap.passion,
    ...ikigaiMap.profession,
    ...ikigaiMap.mission,
    ...ikigaiMap.vocation
  ];

  // Find resources matching user's Ikigai areas
  const resources = await db.resource.findMany({
    where: {
      tags: {
        hasSome: relevantAreas
      }
    },
    orderBy: [
      { likes: 'desc' },
      { views: 'desc' }
    ],
    take: 10
  });

  return resources;
}

export async function getSimilarStories(userId: string): Promise<Story[]> {
  const ikigaiMap = await db.ikigaiMap.findUnique({
    where: { userId }
  });

  if (!ikigaiMap) return [];

  const relevantAreas = [
    ...ikigaiMap.passion,
    ...ikigaiMap.profession,
    ...ikigaiMap.mission,
    ...ikigaiMap.vocation
  ];

  const stories = await db.story.findMany({
    where: {
      tags: {
        hasSome: relevantAreas
      }
    },
    orderBy: {
      likes: 'desc'
    },
    take: 5,
    include: {
      author: {
        select: {
          name: true,
          imageUrl: true
        }
      }
    }
  });

  return stories;
}

export async function getRelevantMiniGames(userId: string): Promise<MiniGame[]> {
  const ikigaiMap = await db.ikigaiMap.findUnique({
    where: { userId }
  });

  if (!ikigaiMap) return [];

  const relevantAreas = [
    ...ikigaiMap.passion,
    ...ikigaiMap.profession,
    ...ikigaiMap.mission,
    ...ikigaiMap.vocation
  ];

  const games = await db.miniGame.findMany({
    where: {
      category: {
        in: relevantAreas
      }
    },
    orderBy: {
      plays: 'desc'
    },
    take: 5
  });

  return games;
}

export async function trackResourceView(resourceId: string) {
  await db.resource.update({
    where: { id: resourceId },
    data: {
      views: {
        increment: 1
      }
    }
  });
}

export async function likeResource(resourceId: string) {
  await db.resource.update({
    where: { id: resourceId },
    data: {
      likes: {
        increment: 1
      }
    }
  });
}
