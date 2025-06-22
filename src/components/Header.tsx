
import { Shield, MessageCircle, Waves, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-3">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="animate-fade-in">
              <h1 className="text-4xl font-light bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Shhh
              </h1>
              <p className="text-xs text-purple-300 font-light tracking-wide">
                Safe Campus Whispers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Shield className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-200">Anonymous & Safe</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 rounded-xl"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Campus Pulse
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
