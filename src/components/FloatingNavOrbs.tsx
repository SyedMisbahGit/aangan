import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  BookOpen,
  Clock,
  Landmark,
  Compass,
  Star,
  Activity,
  User,
} from "lucide-react";

const navItems = [
  { path: "/", icon: <Home />, label: "Home" },
  { path: "/create", icon: <PlusCircle />, label: "Create" },
  { path: "/diary", icon: <BookOpen />, label: "Diary" },
  { path: "/capsules", icon: <Clock />, label: "Capsules" },
  { path: "/shrines", icon: <Landmark />, label: "Shrines" },
  { path: "/compass", icon: <Compass />, label: "Compass" },
  { path: "/constellation", icon: <Star />, label: "Constellation" },
  { path: "/murmurs", icon: <Activity />, label: "Murmurs" },
  { path: "/profile", icon: <User />, label: "Profile" },
];

const FloatingNavOrbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-transparent">
      <div className="flex gap-2 bg-background/80 rounded-full px-3 py-2 shadow-lg backdrop-blur-md border border-primary/10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${isActive ? "bg-gradient-to-br from-primary to-secondary text-white scale-110 shadow-lg" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingNavOrbs;
