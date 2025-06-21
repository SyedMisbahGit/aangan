
import { Shield, MessageCircle, Heart, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Shhh
              </h1>
              <p className="text-xs text-purple-300 font-medium tracking-wide">
                सुरक्षित आवाज़ • Safe Campus Whispers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Shield className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-200">गुमनाम सुरक्षित</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
            >
              <Waves className="h-4 w-4 mr-2" />
              Campus Vibes
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
