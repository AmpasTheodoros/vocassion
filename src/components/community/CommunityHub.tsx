"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Target, Share2, MessageSquare, Trophy, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { formatDistanceToNow } from "date-fns";
import { getCommunityPosts, createCommunityPost, togglePostLike, addComment } from "@/lib/actions/community";
import { getTeamChallenges, joinTeamChallenge } from "@/lib/actions/team-challenges";

interface Comment {
  id: string;
  content: string;
  user: {
    name: string | null;
    imageUrl: string | null;
  };
  createdAt: Date;
}

interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  userName: string | null;
  userImage: string | null;
  content: string;
  type?: "achievement" | "challenge" | "reflection" | "map";
  likeCount: number;
  userLikes: { userId: string }[];
  comments: Comment[];
  createdAt: Date;
}

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  category: "passion" | "skills" | "mission" | "vocation";
  participants: {
    status: string;
    id: string;
    userId: string;
    challengeId: string;
    joinedAt: Date;
    progress: number;
  }[];
  creator: {
    name: string | null;
    imageUrl: string | null;
  };
  endDate: Date;
  rewardPoints: number;
  createdAt: Date;
}

export function CommunityHub() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Fetch initial data
    fetchPosts();
    fetchChallenges();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const data = await getTeamChallenges();
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user?.id) return;

    try {
      await createCommunityPost(user.id, {
        title: "New Post",
        content: newPost,
        type: "reflection",
        communityId: "default", // Using a default community ID - you should replace this with the actual community ID
      });

      setNewPost("");
      await fetchPosts();
      
      // Celebrate contribution
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.5, y: 0.6 },
      });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      await togglePostLike(postId, user.id);
      await fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment[postId]?.trim() || !user?.id) return;

    try {
      await addComment(postId, user.id, newComment[postId]);
      setNewComment({ ...newComment, [postId]: "" });
      await fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      await joinTeamChallenge(challengeId, user.id);
      
      // Celebrate joining
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.5, y: 0.6 },
      });
      
      await fetchChallenges();
    } catch (error) {
      console.error("Error joining challenge:", error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const isLiked = (post: CommunityPost) => {
    return post.userLikes.some(like => like.userId === user?.id);
  };

  const hasJoined = (challenge: TeamChallenge) => {
    return challenge.participants.some(p => p.userId === user?.id);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Hub
            </CardTitle>
            <CardDescription>Connect, share, and grow together</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setActiveTab("challenges")}>
            <Target className="h-4 w-4 mr-2" />
            Join Challenge
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 gap-4 mb-6">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="challenges">Team Challenges</TabsTrigger>
            <TabsTrigger value="maps">Ikigai Maps</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            {/* Post Creation */}
            <Card className="p-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={user?.imageUrl || undefined} />
                  <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your Ikigai journey..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handlePostSubmit}>Share</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={post.userImage || undefined} />
                      <AvatarFallback>{post.userName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{post.userName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline">{post.type}</Badge>
                      </div>
                      <p className="mt-2 text-muted-foreground">{post.content}</p>
                      <div className="flex gap-4 mt-4">
                        <Button 
                          variant={isLiked(post) ? "secondary" : "ghost"} 
                          size="sm"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${isLiked(post) ? "fill-current" : ""}`} />
                          {post.likeCount}
                        </Button>
                        <Button 
                          variant={showComments[post.id] ? "secondary" : "ghost"} 
                          size="sm"
                          onClick={() => toggleComments(post.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {post.comments.length}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 space-y-4">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.imageUrl || undefined} />
                                <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="font-semibold text-sm">{comment.user.name}</p>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {/* New Comment Input */}
                          <div className="flex gap-3 mt-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.imageUrl || undefined} />
                              <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Input
                                value={newComment[post.id] || ""}
                                onChange={(e) => setNewComment({ 
                                  ...newComment, 
                                  [post.id]: e.target.value 
                                })}
                                placeholder="Write a comment..."
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleComment(post.id);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={challenge.creator.imageUrl || undefined} />
                        <AvatarFallback>{challenge.creator.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created by {challenge.creator.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {challenge.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge>{challenge.category}</Badge>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {challenge.participants.length} joined
                      </Badge>
                      <Badge variant="secondary">
                        <Trophy className="h-3 w-3 mr-1" />
                        {challenge.rewardPoints} XP
                      </Badge>
                      <Badge variant="outline">
                        Ends {formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant={hasJoined(challenge) ? "secondary" : "default"}
                    onClick={() => !hasJoined(challenge) && handleJoinChallenge(challenge.id)}
                    disabled={hasJoined(challenge)}
                  >
                    {hasJoined(challenge) ? "Joined" : "Join Challenge"}
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="maps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder for Ikigai Maps */}
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">
                  Coming soon: Share and explore Ikigai maps from the community
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
