import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  GraduationCap,
  Heart,
  Home,
  TestTube,
  Music,
  BookOpen,
  Users,
  Coffee,
  Star,
  Zap,
  Moon,
  Sun,
} from "lucide-react";

interface CUJBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: "hostel" | "academic" | "cultural" | "personality" | "achievement";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  culturalContext: string;
}

const CUJBadgeSystem: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<CUJBadge | null>(null);

  const cujBadges: CUJBadge[] = [
    // Hostel Badges
    {
      id: "1",
      name: "Hostel Heart",
      description: "Loved by hostel community",
      icon: Home,
      color: "text-pink-500",
      category: "hostel",
      rarity: "common",
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      culturalContext: "Hostel wali stories",
    },
    {
      id: "2",
      name: "Night Owl",
      description: "Active during late hours",
      icon: Moon,
      color: "text-indigo-500",
      category: "hostel",
      rarity: "rare",
      unlocked: true,
      progress: 75,
      maxProgress: 100,
      culturalContext: "Hostel ki raat",
    },
    {
      id: "3",
      name: "Roommate Whisperer",
      description: "Great roommate relationships",
      icon: Users,
      color: "text-green-500",
      category: "hostel",
      rarity: "epic",
      unlocked: false,
      progress: 60,
      maxProgress: 100,
      culturalContext: "Roommate bonding",
    },

    // Academic Badges
    {
      id: "4",
      name: "Lab Loner",
      description: "Spends time in labs",
      icon: TestTube,
      color: "text-purple-500",
      category: "academic",
      rarity: "common",
      unlocked: true,
      progress: 90,
      maxProgress: 100,
      culturalContext: "Lab ke baad thakan",
    },
    {
      id: "5",
      name: "Library Guardian",
      description: "Frequent library visitor",
      icon: BookOpen,
      color: "text-blue-500",
      category: "academic",
      rarity: "rare",
      unlocked: true,
      progress: 85,
      maxProgress: 100,
      culturalContext: "Library silence",
    },
    {
      id: "6",
      name: "Exam Warrior",
      description: "Survived exam seasons",
      icon: Zap,
      color: "text-red-500",
      category: "academic",
      rarity: "epic",
      unlocked: false,
      progress: 40,
      maxProgress: 100,
      culturalContext: "Exam fog",
    },

    // Cultural Badges
    {
      id: "7",
      name: "Udaan Seeker",
      description: "Festival enthusiast",
      icon: Music,
      color: "text-yellow-500",
      category: "cultural",
      rarity: "common",
      unlocked: true,
      progress: 100,
      maxProgress: 100,
      culturalContext: "Udaan aftermath",
    },
    {
      id: "8",
      name: "Cultural Ambassador",
      description: "Promotes campus culture",
      icon: Star,
      color: "text-orange-500",
      category: "cultural",
      rarity: "rare",
      unlocked: false,
      progress: 30,
      maxProgress: 100,
      culturalContext: "Campus culture",
    },
    {
      id: "9",
      name: "Festival Legend",
      description: "Legendary festival memories",
      icon: GraduationCap,
      color: "text-pink-600",
      category: "cultural",
      rarity: "legendary",
      unlocked: false,
      progress: 15,
      maxProgress: 100,
      culturalContext: "Festival memories",
    },

    // Personality Badges
    {
      id: "10",
      name: "Canteen Philosopher",
      description: "Deep conversations over chai",
      icon: Coffee,
      color: "text-brown-500",
      category: "personality",
      rarity: "common",
      unlocked: true,
      progress: 80,
      maxProgress: 100,
      culturalContext: "Canteen corner",
    },
    {
      id: "11",
      name: "Quadrangle Speaker",
      description: "Engages in campus discussions",
      icon: Users,
      color: "text-teal-500",
      category: "personality",
      rarity: "rare",
      unlocked: false,
      progress: 50,
      maxProgress: 100,
      culturalContext: "Quadrangle charcha",
    },
    {
      id: "12",
      name: "Sunrise Optimist",
      description: "Early morning positive vibes",
      icon: Sun,
      color: "text-yellow-400",
      category: "personality",
      rarity: "epic",
      unlocked: false,
      progress: 25,
      maxProgress: 100,
      culturalContext: "Morning campus",
    },

    // Achievement Badges
    {
      id: "13",
      name: "Fresher to Senior",
      description: "Completed academic journey",
      icon: GraduationCap,
      color: "text-gold-500",
      category: "achievement",
      rarity: "legendary",
      unlocked: false,
      progress: 70,
      maxProgress: 100,
      culturalContext: "Growth journey",
    },
    {
      id: "14",
      name: "Whisper Master",
      description: "1000+ meaningful whispers",
      icon: Heart,
      color: "text-purple-600",
      category: "achievement",
      rarity: "epic",
      unlocked: false,
      progress: 45,
      maxProgress: 100,
      culturalContext: "Whisper community",
    },
    {
      id: "15",
      name: "Campus Legend",
      description: "Known across campus",
      icon: Star,
      color: "text-rainbow",
      category: "achievement",
      rarity: "legendary",
      unlocked: false,
      progress: 10,
      maxProgress: 100,
      culturalContext: "Campus fame",
    },
  ];

  const categories = {
    all: {
      label: "All Badges",
      icon: Star,
      color: "bg-primary/20 text-primary",
    },
    hostel: {
      label: "Hostel Life",
      icon: Home,
      color: "bg-pink-500/20 text-pink-500",
    },
    academic: {
      label: "Academic",
      icon: BookOpen,
      color: "bg-blue-500/20 text-blue-500",
    },
    cultural: {
      label: "Cultural",
      icon: Music,
      color: "bg-yellow-500/20 text-yellow-500",
    },
    personality: {
      label: "Personality",
      icon: Heart,
      color: "bg-green-500/20 text-green-500",
    },
    achievement: {
      label: "Achievements",
      icon: GraduationCap,
      color: "bg-purple-500/20 text-purple-500",
    },
  };

  const rarityColors = {
    common: "border-gray-300 bg-gray-50",
    rare: "border-blue-300 bg-blue-50",
    epic: "border-purple-300 bg-purple-50",
    legendary: "border-yellow-300 bg-yellow-50",
  };

  const rarityLabels = {
    common: "Common",
    rare: "Rare",
    epic: "Epic",
    legendary: "Legendary",
  };

  const filteredBadges =
    selectedCategory === "all"
      ? cujBadges
      : cujBadges.filter((badge) => badge.category === selectedCategory);

  const unlockedBadges = cujBadges.filter((badge) => badge.unlocked);
  const totalProgress =
    (cujBadges.reduce(
      (sum, badge) => sum + badge.progress / badge.maxProgress,
      0,
    ) /
      cujBadges.length) *
    100;

  const getCategoryData = (category: string) => {
    return categories[category as keyof typeof categories];
  };

  return (
    <div className="space-y-6 p-6">
      {/* CUJ Badge System Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <GraduationCap className="h-6 w-6" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CUJ Badge System
          </h2>
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          Apne CUJ journey ko badges mein capture karo
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Star className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {unlockedBadges.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Unlocked Badges
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {cujBadges.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(totalProgress)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Overall Progress
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card className="glass border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Heart className="h-5 w-5" />
            Badge Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <Card className="glass border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Zap className="h-5 w-5" />
            Available Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const Icon = badge.icon;
              const categoryData = getCategoryData(badge.category);
              const CategoryIcon = categoryData.icon;

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
                    badge.unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-muted/30 bg-muted/5 opacity-60"
                  } ${selectedBadge?.id === badge.id ? "ring-2 ring-primary/50" : ""}`}
                  onClick={() => setSelectedBadge(badge)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${badge.color}`} />
                      <span className="font-medium text-sm">{badge.name}</span>
                    </div>
                    <Badge
                      variant={badge.unlocked ? "default" : "outline"}
                      className="text-xs"
                    >
                      {rarityLabels[badge.rarity]}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {badge.progress}/{badge.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          badge.unlocked
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                        style={{
                          width: `${(badge.progress / badge.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      {categoryData.label}
                    </Badge>
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {badge.culturalContext}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Details */}
      {selectedBadge && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <selectedBadge.icon className="h-5 w-5" />
              {selectedBadge.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <strong>Description:</strong> {selectedBadge.description}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cultural Context:</strong>{" "}
                {selectedBadge.culturalContext}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rarity
                </label>
                <Badge variant="outline" className="mt-1">
                  {rarityLabels[selectedBadge.rarity]}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Badge
                  variant={selectedBadge.unlocked ? "default" : "outline"}
                  className="mt-1"
                >
                  {selectedBadge.unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Progress
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      selectedBadge.unlocked
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                    style={{
                      width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {selectedBadge.progress}/{selectedBadge.maxProgress}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CUJBadgeSystem;
