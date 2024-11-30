import { initialProfile } from '@/lib/initial-profile';
import { redirect } from 'next/navigation';
import React from 'react'

const DashboardPage = async () => {
    const profile = await initialProfile();

    if (!profile) {
      console.log("Profile not found, redirecting to sign-in");
      return redirect('/sign-in'); // Ensure this is an absolute path
    }
    
    return (
        <div className="flex flex-col gap-4 relative">
            <h1 className="text-4xl sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b">
                Dashboard
            </h1>
        </div>
    )
}

export default DashboardPage