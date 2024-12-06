import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { Quest } from "@/components/quest"
import { Promo } from "@/components/promo"
import { redirect } from "next/navigation"
import { getTopTenUsers, getUserProgress, getUserSubscription } from "@/db/queries"

const ProfilePage = async () => {

  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()
  const leaderboardData = getTopTenUsers()

  const [userProgress, userSubscription, leaderboard] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    leaderboardData,
  ])

  if (!userProgress || !userProgress.activeCourse) {
    redirect('/courses')
  }

  const isPro = !!userSubscription?.isActive
  
  return (
    <div className='flex flex-row-reverse gap-[48px] px-6 pt-6'>
      <StickyWrapper className="w-[300px]">
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          activeSubscription={isPro}
        />
        {!isPro && <Promo />}
        <Quest points={userProgress.points} />
      </StickyWrapper>
      <div className='flex-1 max-w-[800px]'>
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-purple-500 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500 opacity-50"></div>
            <div className="relative z-10">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white">
                <AvatarImage src={userProgress.userImageSrc || "/placeholder-avatar.jpg"} alt="Profile Picture" />
                <AvatarFallback className="text-2xl">{userProgress.userName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold text-white mb-2 text-center">{userProgress.userName || "User"}</h1>
              <p className="text-white/90 text-center text-lg">Level {Math.floor(userProgress.points / 100)} Learner</p>
              <div className="flex justify-center gap-4 mt-4 text-white/90">
                <span>{userProgress.points} XP</span>
                <span>•</span>
                <span>Joined {new Date(userProgress.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="bg-card">
              <CardHeader className="text-center p-6">
                <CardTitle className="text-2xl mb-2">XP Points</CardTitle>
                <p className="text-3xl font-bold text-primary">{userProgress.points}</p>
              </CardHeader>
            </Card>
            <Card className="bg-card">
              <CardHeader className="text-center p-6">
                <CardTitle className="text-2xl mb-2">Hearts</CardTitle>
                <p className="text-3xl font-bold text-primary">{userProgress.hearts}</p>
              </CardHeader>
            </Card>
            <Card className="bg-card">
              <CardHeader className="text-center p-6">
                <CardTitle className="text-2xl mb-2">Streak</CardTitle>
                <p className="text-3xl font-bold text-primary">{userProgress.streak || 0}</p>
              </CardHeader>
            </Card>
          </div>

          {/* Progress Section */}
          <Card className="p-6">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl">Current Progress</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-lg font-medium">Active Course</span>
                    <span className="text-lg font-medium text-primary">{userProgress.activeCourse?.title}</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full">
                    <div 
                      className="h-3 bg-primary rounded-full transition-all" 
                      style={{ 
                        width: `${(userProgress.points % 100)}%`
                      }}
                    />
                  </div>
                </div>
                {isPro && (
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-lg font-medium">Pro Status</span>
                      <span className="text-lg font-medium text-primary">Active</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full">
                      <div className="h-3 bg-primary rounded-full w-full" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Position */}
          <Card className="p-6">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl">Leaderboard Standing</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {leaderboard.map((user, index) => (
                user.userId === userProgress.userId && (
                  <div key={user.userId} className="text-center">
                    <p className="text-4xl font-bold text-primary mb-2">#{index + 1}</p>
                    <p className="text-lg text-muted-foreground">Top {Math.round(((index + 1) / leaderboard.length) * 100)}%</p>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage