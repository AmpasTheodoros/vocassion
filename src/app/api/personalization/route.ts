import { NextResponse } from "next/server";
import { getPersonalizedContent } from "@/lib/actions/personalization";

export { dynamic } from './route.config';

export async function GET() {
  try {
    const personalizedContent = await getPersonalizedContent();
    return NextResponse.json(personalizedContent);
  } catch (error) {
    console.error("Error fetching personalized content:", error);
    return NextResponse.json(
      { error: "Failed to fetch personalized content" },
      { status: 500 }
    );
  }
}
