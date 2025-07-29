import { Calendar, Compass, Star, MessageCircle, Package } from "lucide-react";

export const overflowMenuItems = [
  // Explore Section
  {
    path: "/explore",
    label: "Explore",
    description: "Discover campus whispers",
    icon: Compass,
    category: "explore"
  },
  {
    path: "/constellation",
    label: "Constellation",
    description: "See the bigger picture",
    icon: Star,
    category: "explore"
  },
  {
    path: "/compass",
    label: "Compass",
    description: "Navigate your emotions",
    icon: Calendar,
    category: "explore"
  },
  {
    path: "/lounge",
    label: "Lounge",
    description: "Chill conversations",
    icon: MessageCircle,
    category: "explore"
  },
  
  // Info Section
  {
    path: "/about",
    label: "About",
    description: "Learn about Aangan",
    icon: Package,
    category: "info"
  }
];

// Utility to determine if a route is user-facing
export function isUserFacingRoute(pathname: string) {
  // Add or remove routes as needed
  const nonUserFacing = [
    '/admin', '/admin/', '/admin/dashboard', '/admin/reports', '/admin/bans', 
    '/admin/whispers', '/admin/users', '/admin/ai-jobs', '/admin/settings',
    '/login', '/notfound', '/404', '/500', '/error', '/adminlogin', '/admininsights'
  ];
  return !nonUserFacing.some(route => pathname.startsWith(route));
}
