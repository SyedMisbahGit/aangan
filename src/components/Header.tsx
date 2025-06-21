
import { Shield, MessageCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MessageCircle className="h-8 w-8 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Shhh</h1>
              <p className="text-xs text-purple-300">Anonymous Campus Voice</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Protected & Anonymous</span>
            </div>
            
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <TrendingUp className="h-4 w-4 mr-2" />
              Campus Pulse
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
