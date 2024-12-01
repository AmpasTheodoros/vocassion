import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, GamepadIcon } from "lucide-react";

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

interface MiniGame {
  id: string;
  title: string;
  description: string;
  type: string;
}

export function PersonalizedContent() {
  const [data, setData] = useState<{
    resources: Resource[];
    stories: Story[];
    games: MiniGame[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/personalization");
      const result = await response.json();
      setData(result);
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <Tabs defaultValue="resources" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="stories">Stories</TabsTrigger>
        <TabsTrigger value="games">Mini Games</TabsTrigger>
      </TabsList>

      <TabsContent value="resources">
        <ScrollArea className="h-[500px]">
          {data.resources.map((resource) => (
            <Card key={resource.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {resource.title}
                  <Button variant="ghost" size="icon" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardTitle>
                <CardDescription>{resource.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{resource.description}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="stories">
        <ScrollArea className="h-[500px]">
          {data.stories.map((story) => (
            <Card key={story.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {story.title}
                </CardTitle>
                <CardDescription>By {story.author.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{story.content}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="games">
        <ScrollArea className="h-[500px]">
          {data.games.map((game) => (
            <Card key={game.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GamepadIcon className="h-5 w-5" />
                  {game.title}
                </CardTitle>
                <CardDescription>{game.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{game.description}</p>
                <Button className="mt-4">Play Now</Button>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
