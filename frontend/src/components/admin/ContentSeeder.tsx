import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Sparkles, TrendingUp, Coffee, BookOpen, Heart } from "lucide-react";

interface SeedPost {
  id: string;
  content: string;
  category: string;
  reactions: {
    hearts: number;
    comments: number;
  };
  isSeeded: boolean;
}

export const ContentSeeder = () => {
  const [seedPosts] = useState<SeedPost[]>([
    {
      id: "seed1",
      content:
        "Anyone else think the new library hours are actually perfect for late-night study sessions? Finally somewhere quiet after 10pm!",
      category: "🎓 Academic Concerns",
      reactions: { hearts: 12, comments: 4 },
      isSeeded: true,
    },
    {
      id: "seed2",
      content:
        "PSA: The coffee machine on the second floor of the student center is broken again. Save your money and go to the third floor!",
      category: "📢 Campus Alert",
      reactions: { hearts: 8, comments: 2 },
      isSeeded: true,
    },
    {
      id: "seed3",
      content:
        "Just wanted to say thank you to whoever left encouraging sticky notes in the bathroom stalls during finals week. You made my day! 💚",
      category: "💬 Confession",
      reactions: { hearts: 24, comments: 7 },
      isSeeded: true,
    },
  ]);

  const getCategoryIcon = (category: string) => {
    if (category.includes("Academic")) return <BookOpen className="h-4 w-4" />;
    if (category.includes("Alert")) return <TrendingUp className="h-4 w-4" />;
    if (category.includes("Confession")) return <Heart className="h-4 w-4" />;
    return <Coffee className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Campus Conversations</h3>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
          Community Voices
        </Badge>
      </div>

      {seedPosts.map((post) => (
        <Card
          key={post.id}
          className="bg-white/5 backdrop-blur-md border-white/10 p-4"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(post.category)}
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-200"
              >
                {post.category}
              </Badge>
              {post.isSeeded && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-200 text-xs"
                >
                  Community Post
                </Badge>
              )}
            </div>

            <p className="text-white leading-relaxed">{post.content}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{post.reactions.hearts}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>{post.reactions.comments} replies</span>
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
