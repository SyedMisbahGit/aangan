
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Shield, AlertTriangle, Heart, Brain, Megaphone, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostCreatorProps {
  onNewPost: () => void;
}

export const PostCreator = ({ onNewPost }: PostCreatorProps) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: "confession", label: "💬 Confession", icon: Heart },
    { id: "academic", label: "🎓 Academic Concerns", icon: Brain },
    { id: "campus-alert", label: "📢 Campus Alert", icon: Megaphone },
    { id: "mental-health", label: "🧠 Mental Health", icon: Brain },
    { id: "innovation", label: "🧪 Innovation/Events", icon: Lightbulb },
    { id: "callout", label: "❗ Issue/Callout", icon: AlertTriangle },
  ];

  const moderateContent = (text: string) => {
    const flags = [];
    
    // Check for personal information
    if (/\b\d{10}\b|\b[A-Z]{2}\d{6}\b/g.test(text)) {
      flags.push("Contains potential personal information");
    }
    
    // Check for harmful content
    const harmfulPatterns = [
      /\b(kill|suicide|end it all|hurt myself)\b/i,
      /\b(hate|disgusting|worthless)\s+(you|them|students)\b/i
    ];
    
    if (harmfulPatterns.some(pattern => pattern.test(text))) {
      flags.push("Contains potentially harmful language");
    }
    
    return flags;
  };

  const handleSubmit = async () => {
    if (!content.trim() || !category) {
      toast({
        title: "Incomplete Post",
        description: "Please add content and select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Content moderation
    const flags = moderateContent(content);
    
    if (flags.length > 0) {
      toast({
        title: "Content Review Required",
        description: flags.join(". ") + ". Please review your post.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate post submission
    setTimeout(() => {
      toast({
        title: "Post Shared Anonymously",
        description: "Your voice has been heard safely and securely.",
      });
      setContent("");
      setCategory("");
      setIsSubmitting(false);
      onNewPost();
    }, 1500);
  };

  const selectedCategory = categories.find(cat => cat.id === category);

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-green-400" />
          <span className="text-white font-medium">Share Anonymously</span>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
            Protected
          </Badge>
        </div>

        <Textarea
          placeholder="What's happening on campus? Share your thoughts, confessions, or concerns anonymously..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none h-32"
          maxLength={500}
        />

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{content.length}/500 characters</span>
          {content && (
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-green-400" />
              <span>Content being analyzed...</span>
            </span>
          )}
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-white/5 border-white/20 text-white">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/20">
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-white/10">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory && (
          <div className="flex items-center space-x-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <selectedCategory.icon className="h-4 w-4 text-purple-400" />
            <span className="text-purple-200 text-sm">Posting in {selectedCategory.label}</span>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || !category || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Sharing Anonymously..." : "Share Anonymously"}
        </Button>

        <div className="text-xs text-gray-400 text-center">
          Your identity remains completely anonymous. Posts are moderated for safety.
        </div>
      </div>
    </Card>
  );
};
