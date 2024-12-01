import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { Brain, Briefcase, Heart, Bell, Calendar, Settings2, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import { IkigaiMap } from "@/components/ikigai/ikigai-map";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
  };
}

interface Game {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface IkigaiData {
  passion: string[];
  mission: string[];
  profession: string[];
  vocation: string[];
}

const DashboardMetric = ({ title, value, icon: Icon, description }: { 
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ActivityFeed = () => (
  <Card className="col-span-3 lg:col-span-1">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px] pr-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-4 flex items-center gap-4 rounded-lg border p-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New Resource Added</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="mb-4">
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 mb-4" />
          <Skeleton className="h-9 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export function PersonalizedDashboard() {
  const { user } = useUser();
  const [data, setData] = useState<{
    resources: Resource[];
    stories: Story[];
    games: Game[];
    ikigai?: IkigaiData;
  }>({
    resources: [],
    stories: [],
    games: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personalizedResponse, ikigaiResponse] = await Promise.all([
          fetch("/api/personalization"),
          fetch(`/api/profile/${user?.id}/ikigai`)
        ]);
        
        const personalizedData = await personalizedResponse.json();
        const ikigaiData = await ikigaiResponse.json();
        
        console.log('Ikigai API Response:', ikigaiData); // Debug log
        
        const processedIkigai = processIkigaiData(ikigaiData);
        console.log('Processed Ikigai Data:', processedIkigai); // Debug log
        
        setData({
          ...personalizedData,
          ikigai: processedIkigai
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const processIkigaiData = (assessmentData: {
    passion: string[];
    mission: string[];
    profession: string[];
    vocation: string[];
  }) => {
    if (!assessmentData || Object.keys(assessmentData).length === 0) {
      console.log('No assessment data found');
      return null;
    }
    
    const processed = {
      passion: assessmentData.passion || [],
      mission: assessmentData.mission || [],
      profession: assessmentData.profession || [],
      vocation: assessmentData.vocation || []
    };
    
    // Check if we have any data
    const hasData = Object.values(processed).some(arr => arr.length > 0);
    return hasData ? processed : null;
  };

  if (!user) return null;

  const metrics = [
    {
      title: "Total Resources",
      value: data.resources?.length || 0,
      icon: Briefcase,
      description: "Available learning resources"
    },
    {
      title: "Stories",
      value: data.stories?.length || 0,
      icon: Heart,
      description: "Shared community stories"
    },
    {
      title: "Games",
      value: data.games?.length || 0,
      icon: Brain,
      description: "Interactive learning games"
    },
    {
      title: "Progress",
      value: "67%",
      icon: BarChart3,
      description: "Overall completion rate"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10">
            <Image
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="h-full w-full rounded-full object-cover"
              width={48}
              height={48}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user.firstName}!</h2>
            <p className="text-sm text-muted-foreground">Here&apos;s your learning dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.title} {...metric} />
        ))}
      </div>

      {/* Ikigai Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Ikigai Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ) : data.ikigai ? (
            <IkigaiMap data={data.ikigai} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Complete your Ikigai assessment to see your map</p>
              <Button variant="outline" className="mt-4">
                Take Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Resources Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Latest Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                data.resources?.slice(0, 3).map((resource, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button variant="link" className="mt-4">
              View all resources
            </Button>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>

      {/* Stories and Games Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Featured Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.stories?.slice(0, 3).map((story, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <h4 className="font-medium">{story.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{story.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">By {story.author.name}</p>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4">
              View all stories
            </Button>
          </CardContent>
        </Card>

        {/* Games Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Available Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.games?.slice(0, 3).map((game, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{game.title}</h4>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </div>
                  <Button size="sm">Play</Button>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4">
              View all games
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
