import Navbar from "@/components/global/navbar";
import Sidebar from "@/components/global/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full relative">
    <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-800">
        <Sidebar/>
    </div>
    <main className="md:pl-72">
        <Navbar/>
        {children}
    </main>
</div>
  );
}
