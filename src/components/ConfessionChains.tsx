import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Link, MessageCircle, Heart, Sparkles, Users, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChainMessage {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  chainId: string;
  parentId?: string;
  reactions: {
    heart: number;
    spark: number;
    echo: number;
  };
  isAnonymous: boolean;
  depth: number;
}

interface ConfessionChain {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  participants: number;
  isActive: boolean;
  tags: string[];
}

export const ConfessionChains = () => {
  const [chains, setChains] = useState<ConfessionChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<ConfessionChain | null>(null);
  const [messages, setMessages] = useState<ChainMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isCreatingChain, setIsCreatingChain] = useState(false);
  const [newChainTitle, setNewChainTitle] = useState("");
  const [newChainDescription, setNewChainDescription] = useState("");
  const { toast } = useToast();

  // Sample chains
  useEffect(() => {
    const sampleChains: ConfessionChain[] = [
      {
        id: "1",
        title: "The Library at 3 AM",
        description: "When the world sleeps and thoughts run wild...",
        category: "Late Night",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 15 * 60 * 1000),
        messageCount: 12,
        participants: 8,
        isActive: true,
        tags: ["study", "loneliness", "reflection"],
      },
      {
        id: "2",
        title: "First Love Confessions",
        description: "The butterflies, the confusion, the magic...",
        category: "Love",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        messageCount: 23,
        participants: 15,
        isActive: true,
        tags: ["romance", "first-time", "emotions"],
      },
      {
        id: "3",
        title: "Imposter Syndrome Stories",
        description: "When you feel like you don't belong...",
        category: "Academic",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 45 * 60 * 1000),
        messageCount: 18,
        participants: 12,
        isActive: true,
        tags: ["self-doubt", "academic", "growth"],
      },
    ];
    setChains(sampleChains);
  }, []);

  // Load messages for selected chain
  useEffect(() => {
    if (selectedChain) {
      const sampleMessages: ChainMessage[] = [
        {
          id: "1",
          content: "The silence in the library at 3 AM hits different when you're questioning every life choice...",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          author: "burning-teacup",
          chainId: selectedChain.id,
          reactions: { heart: 8, spark: 3, echo: 2 },
          isAnonymous: true,
          depth: 0,
        },
        {
          id: "2",
          content: "I feel this so much. The fluorescent lights make everything feel surreal.",
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          author: "midnight-owl",
          chainId: selectedChain.id,
          parentId: "1",
          reactions: { heart: 5, spark: 1, echo: 0 },
          isAnonymous: true,
          depth: 1,
        },
        {
          id: "3",
          content: "And when someone else is there, you both pretend not to see each other's existential crisis",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          author: "quiet-observer",
          chainId: selectedChain.id,
          parentId: "1",
          reactions: { heart: 12, spark: 4, echo: 1 },
          isAnonymous: true,
          depth: 1,
        },
      ];
      setMessages(sampleMessages);
    }
  }, [selectedChain]);

  const createChain = () => {
    if (!newChainTitle.trim() || !newChainDescription.trim()) return;

    const newChain: ConfessionChain = {
      id: Date.now().toString(),
      title: newChainTitle,
      description: newChainDescription,
      category: "General",
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      participants: 1,
      isActive: true,
      tags: [],
    };

    setChains(prev => [newChain, ...prev]);
    setNewChainTitle("");
    setNewChainDescription("");
    setIsCreatingChain(false);

    toast({
      title: "Chain created",
      description: "Your confession chain is now live!",
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChain) return;

    const message: ChainMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      author: "anonymous-user",
      chainId: selectedChain.id,
      parentId: replyTo || undefined,
      reactions: { heart: 0, spark: 0, echo: 0 },
      isAnonymous: true,
      depth: replyTo ? 1 : 0,
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage("");
    setReplyTo(null);

    // Update chain stats
    setChains(prev => prev.map(chain => 
      chain.id === selectedChain.id 
        ? { ...chain, messageCount: chain.messageCount + 1, lastActivity: new Date() }
        : chain
    ));

    toast({
      title: "Message sent",
      description: "Your voice joins the chain...",
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderMessage = (message: ChainMessage) => {
    const replies = messages.filter(m => m.parentId === message.id);
    
    return (
      <div key={message.id} className="space-y-3">
        <Card className={`bg-white/5 backdrop-blur-lg border-white/10 p-4 hover:bg-white/10 transition-all duration-300 ${message.depth > 0 ? 'ml-6' : ''}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full w-full h-full flex items-center justify-center text-white text-xs font-medium">
                    {message.author.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <div>
                  <p className="text-white text-sm font-medium">{message.author}</p>
                  <p className="text-gray-400 text-xs">{getTimeAgo(message.timestamp)}</p>
                </div>
              </div>
              {message.depth > 0 && (
                <ArrowRight className="h-4 w-4 text-gray-500 rotate-90" />
              )}
            </div>

            <p className="text-gray-200 text-sm">{message.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(message.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                    <Heart className="h-4 w-4 mr-1" />
                    {message.reactions.heart}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400">
                    <Sparkles className="h-4 w-4 mr-1" />
                    {message.reactions.spark}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {replies.map(reply => renderMessage(reply))}
      </div>
    );
  };

  if (selectedChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedChain(null)}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Chains
          </Button>
          <Badge className="bg-purple-500/20 text-purple-200">
            {selectedChain.messageCount} messages
          </Badge>
        </div>

        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg border-purple-500/20 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Link className="h-6 w-6 text-purple-300" />
              <h2 className="text-xl font-light text-white">{selectedChain.title}</h2>
            </div>
            <p className="text-gray-300 text-sm">{selectedChain.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{selectedChain.participants} participants</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Last active {getTimeAgo(selectedChain.lastActivity)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {replyTo && (
            <Card className="bg-blue-900/20 border-blue-500/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-blue-200 text-sm">Replying to a message...</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="text-blue-300 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <div className="flex space-x-3">
            <Textarea
              id="chain-message"
              name="chain-message"
              placeholder={replyTo ? "Write your reply..." : "Join the conversation..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={3}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/30"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {messages.filter(m => !m.parentId).map(renderMessage)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-light text-white">Confession Chains</h2>
        </div>
        <Button
          onClick={() => setIsCreatingChain(true)}
          className="bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/30"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Start Chain
        </Button>
      </div>

      {isCreatingChain && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg border-purple-500/20 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-light text-white">Create New Chain</h3>
            <div className="space-y-3">
              <input
                type="text"
                id="chain-title"
                name="chain-title"
                placeholder="Chain title..."
                value={newChainTitle}
                onChange={(e) => setNewChainTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white placeholder:text-gray-400 rounded-lg px-3 py-2"
              />
              <textarea
                id="chain-description"
                name="chain-description"
                placeholder="Describe what this chain is about..."
                value={newChainDescription}
                onChange={(e) => setNewChainDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white placeholder:text-gray-400 rounded-lg px-3 py-2 resize-none"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={createChain}
                disabled={!newChainTitle.trim() || !newChainDescription.trim()}
                className="bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/30"
              >
                Create Chain
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsCreatingChain(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chains.map((chain) => (
          <Card
            key={chain.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 p-6 hover:bg-white/10 transition-all duration-500 cursor-pointer group"
            onClick={() => setSelectedChain(chain)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{chain.title}</h3>
                <Badge className="bg-purple-500/20 text-purple-200 text-xs">
                  {chain.category}
                </Badge>
              </div>
              
              <p className="text-gray-300 text-sm">{chain.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{chain.messageCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{chain.participants}</span>
                  </div>
                </div>
                <span>{getTimeAgo(chain.lastActivity)}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {chain.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 