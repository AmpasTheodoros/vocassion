import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatComponent from "@/components/chat/ChatComponent";

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Community Chat</h1>
      <ChatComponent />
    </div>
  );
}
