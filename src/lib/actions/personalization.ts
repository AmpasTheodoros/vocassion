/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

async function getPersonalizedRecommendations(_userInterests: string[], _userSkills: string[]) {
  // Return static recommendations for now
  return [
    {
      title: "Learn Web Development",
      description: "Master modern web technologies like React, Next.js, and TypeScript",
      type: "course",
      url: "https://example.com/web-dev"
    },
    {
      title: "Open Source Contributing",
      description: "Contribute to open source projects and build your portfolio",
      type: "volunteer",
      url: "https://github.com/explore"
    },
    {
      title: "Frontend Developer",
      description: "Join our team as a frontend developer",
      type: "job",
      url: "https://example.com/jobs"
    }
  ];
}

async function generateInspirationalStories(_userInterests: string[]) {
  // Return static stories for now
  return [
    {
      title: "Finding Purpose Through Code",
      content: "A journey from beginner to professional developer",
      author: { name: "John Doe" }
    },
    {
      title: "Building Communities",
      content: "How I found my passion in helping others learn",
      author: { name: "Jane Smith" }
    }
  ];
}

async function createMiniGames(_userSkills: string[]) {
  // Return static games for now
  return [
    {
      title: "Code Challenge",
      description: "Solve coding puzzles to improve your skills",
      type: "problem-solving",
      category: "skill"
    },
    {
      title: "Idea Generator",
      description: "Generate creative project ideas",
      type: "brainstorming",
      category: "passion"
    }
  ];
}

export async function getPersonalizedContent() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.profile.findUnique({
    where: { userId },
    include: {
      ikigaiMap: true,
    },
  });

  if (!user || !user.ikigaiMap) {
    throw new Error("User or IkigaiMap not found");
  }

  // Get recommendations based on ikigai map
  const recommendations = await getPersonalizedRecommendations(
    user.ikigaiMap.passion,
    user.ikigaiMap.profession
  );

  // Generate stories based on passions
  const stories = await generateInspirationalStories(user.ikigaiMap.passion);

  // Create mini-games based on skills
  const games = await createMiniGames(user.ikigaiMap.profession);

  return {
    recommendations,
    stories,
    games,
  };
}
