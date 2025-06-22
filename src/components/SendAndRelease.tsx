import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Wind, Feather, Sparkles } from "lucide-react";

export const SendAndRelease = () => {
  const [message, setMessage] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  const handleRelease = async () => {
    if (!message.trim()) return;

    setIsReleasing(true);
    
    // Animation simulation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsReleasing(false);
    setReleased(true);
    setMessage("");
    
    // Reset after showing confirmation
    setTimeout(() => setReleased(false), 4000);
  };

  if (released) {
    return (
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-6 text-center animate-fade-in">
          <div className="flex items-center justify-center space-x-3">
            <Wind className="h-8 w-8 text-purple-300 animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-medium text-lg">It's out there now.</h3>
            <p className="text-purple-200">You're lighter.</p>
            <p className="text-gray-400 text-sm">
              Your words have joined the wind, carrying what you needed to release.
            </p>
          </div>

          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (isReleasing) {
    return (
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Feather className="h-8 w-8 text-purple-300 animate-bounce" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-medium text-lg animate-pulse">Releasing...</h3>
            <p className="text-purple-200">Your words are taking flight</p>
          </div>

          {/* Floating animation */}
          <div className="relative h-20 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-purple-400/60 rounded-full animate-float"
                style={{
                  left: `${10 + i * 10}%`,
                  animationDelay: `${i * 300}ms`,
                  animationDuration: '3s'
                }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Send className="h-6 w-6 text-purple-300 animate-pulse" />
          <div>
            <h3 className="text-white font-medium">Send & Release</h3>
            <p className="text-gray-400 text-sm">Words never meant to be read</p>
          </div>
        </div>

        {/* Writing Space */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-purple-200 text-sm font-medium">Let it go</span>
            </div>
            <p className="text-purple-100 text-sm italic">
              "Write what weighs on you. Send it to the void. Let the universe hold it for you."
            </p>
          </div>

          <Textarea
            id="release-message"
            name="release-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What do you need to release into the universe?"
            className="bg-white/5 border-white/10 text-white placeholder-gray-400 min-h-[120px] resize-none focus:ring-purple-400/50"
          />
          
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-xs">
              This will disappear forever, never to be stored or read
            </p>
            <Button 
              onClick={handleRelease}
              disabled={!message.trim()}
              className="bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white"
            >
              <Wind className="h-4 w-4 mr-2" />
              Release
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-md">
          <p className="text-gray-300 text-sm leading-relaxed">
            Sometimes we write not to be understood, but to understand. 
            This space holds what you need to let go.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center space-x-4 opacity-50">
          {[Wind, Feather, Sparkles].map((Icon, i) => (
            <Icon 
              key={i}
              className="h-4 w-4 text-purple-400 animate-pulse" 
              style={{ animationDelay: `${i * 500}ms` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
