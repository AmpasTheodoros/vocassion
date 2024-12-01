import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPersonalizedResources, getSimilarStories, getRelevantMiniGames } from "@/lib/actions/personalized-content";
import { Resource, Story, MiniGame } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, ThumbsUp, PlayCircle } from "lucide-react";

export function PersonalizedContent() {
  const { user } = useUser();
  const [resources, setResources] = useState<Resource[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [games, setGames] = useState<MiniGame[]>([]);
  const [activeTab, setActiveTab] = useState("resources");

  const loadPersonalizedContent = useCallback(async () => {
    if (!user?.id) return;

    const [resourcesData, storiesData, gamesData] = await Promise.all([
      getPersonalizedResources(user.id),
      getSimilarStories(user.id),
      getRelevantMiniGames(user.id)
    ]);

    setResources(resourcesData);
    setStories(storiesData);
    setGames(gamesData);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadPersonalizedContent();
    }
  }, [user, loadPersonalizedContent]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personalized For You</CardTitle>
        <CardDescription>
          Discover content tailored to your Ikigai journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="games">Mini Games</TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <div className="grid gap-4 mt-4">
              {resources.map((resource) => (
                <Card key={resource.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <div className="flex gap-2 mt-2">
                        {resource.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <div className="grid gap-4 mt-4">
              {stories.map((story) => (
                <Card key={story.id} className="p-4">
                  <h4 className="font-semibold">{story.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {story.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm">{story.likes}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="grid gap-4 mt-4">
              {games.map((game) => (
                <Card key={game.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{game.title}</h4>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
