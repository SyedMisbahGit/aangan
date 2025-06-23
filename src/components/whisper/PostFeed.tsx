import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Post {
  id: string;
  content: string;
  category: string;
  timestamp: Date;
  reactions: {
    hearts: number;
    comments: number;
    shares: number;
  };
  sentiment: "positive" | "neutral" | "negative";
  trending: boolean;
}

interface PostFeedProps {
  refreshTrigger: number;
}

export const PostFeed = ({ refreshTrigger }: PostFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const samplePosts: Post[] = [
    {
      id: "1",
      content:
        "The new cafeteria food is actually amazing! Finally some variety and the portions are generous. Shoutout to whoever made this happen 🙌",
      category: "💬 Confession",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reactions: { hearts: 24, comments: 8, shares: 3 },
      sentiment: "positive",
      trending: true,
    },
    {
      id: "2",
      content:
        "Anyone else feeling overwhelmed with the workload this semester? It feels like every professor thinks their subject is the only one we're taking...",
      category: "🎓 Academic Concerns",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      reactions: { hearts: 42, comments: 15, shares: 7 },
      sentiment: "negative",
      trending: false,
    },
    {
      id: "3",
      content:
        "PSA: The library WiFi is down on the 3rd floor. IT says it'll be fixed by tomorrow morning. Study accordingly!",
      category: "📢 Campus Alert",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      reactions: { hearts: 18, comments: 3, shares: 12 },
      sentiment: "neutral",
      trending: false,
    },
  ];

  useEffect(() => {
    setPosts(samplePosts);
  }, [refreshTrigger]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "💬 Confession": "bg-pink-500/20 text-pink-200",
      "🎓 Academic Concerns": "bg-blue-500/20 text-blue-200",
      "📢 Campus Alert": "bg-red-500/20 text-red-200",
      "🧠 Mental Health": "bg-green-500/20 text-green-200",
      "🧪 Innovation/Events": "bg-purple-500/20 text-purple-200",
      "❗ Issue/Callout": "bg-orange-500/20 text-orange-200",
    };
    return colors[category] || "bg-gray-500/20 text-gray-200";
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: { [key: string]: string } = {
      positive: "text-green-400",
      neutral: "text-yellow-400",
      negative: "text-red-400",
    };
    return colors[sentiment] || "text-gray-400";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) return `${diffHours}h ago`;
    return `${diffMins}m ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Campus Feed</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Real-time updates</span>
        </div>
      </div>

      {posts.map((post) => (
        <Card
          key={post.id}
          className="bg-white/5 backdrop-blur-md border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={getCategoryColor(post.category)}>
                  {post.category}
                </Badge>
                {post.trending && (
                  <Badge className="bg-yellow-500/20 text-yellow-200 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Trending</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full ${getSentimentColor(post.sentiment)}`}
                />
                <span>{formatTimeAgo(post.timestamp)}</span>
              </div>
            </div>

            {/* Content */}
            <p className="text-white leading-relaxed">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-pink-400 hover:bg-pink-400/10"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {post.reactions.hearts}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.reactions.comments}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-green-400 hover:bg-green-400/10"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {post.reactions.shares}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-400"
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
