import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Butterfly, Star, Target, Calendar, TrendingUp, Heart, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GrowthMilestone {
  id: string;
  title: string;
  description: string;
  category: "emotional" | "academic" | "social" | "personal";
  date: Date;
  impact: number; // 1-10
  isCompleted: boolean;
  tags: string[];
}

interface GrowthPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  milestones: string[];
  isActive: boolean;
  progress: number; // 0-100
}

export const MetamorphosisTracker = () => {
  const [milestones, setMilestones] = useState<GrowthMilestone[]>([]);
  const [phases, setPhases] = useState<GrowthPhase[]>([]);
  const [currentPhase, setCurrentPhase] = useState<GrowthPhase | null>(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"emotional" | "academic" | "social" | "personal">("emotional");
  const { toast } = useToast();

  // Sample growth phases
  useEffect(() => {
    const samplePhases: GrowthPhase[] = [
      {
        id: "1",
        name: "Cocoon Phase",
        description: "Self-reflection and inner growth",
        duration: 30,
        milestones: ["First honest diary entry", "Recognized a pattern", "Asked for help"],
        isActive: true,
        progress: 75,
      },
      {
        id: "2",
        name: "Emergence Phase",
        description: "Stepping out of comfort zones",
        duration: 45,
        milestones: ["Shared a vulnerable thought", "Made a new friend", "Tried something new"],
        isActive: false,
        progress: 0,
      },
      {
        id: "3",
        name: "Flight Phase",
        description: "Spreading wings and soaring",
        duration: 60,
        milestones: ["Became a mentor", "Started a project", "Found my voice"],
        isActive: false,
        progress: 0,
      },
    ];
    setPhases(samplePhases);
    setCurrentPhase(samplePhases[0]);
  }, []);

  // Sample milestones
  useEffect(() => {
    const sampleMilestones: GrowthMilestone[] = [
      {
        id: "1",
        title: "First Honest Diary Entry",
        description: "Wrote about my deepest fears without sugar-coating",
        category: "emotional",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        impact: 8,
        isCompleted: true,
        tags: ["vulnerability", "self-awareness"],
      },
      {
        id: "2",
        title: "Recognized a Pattern",
        description: "I noticed I always feel anxious before exams, not during them",
        category: "academic",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        impact: 7,
        isCompleted: true,
        tags: ["self-awareness", "anxiety"],
      },
      {
        id: "3",
        title: "Asked for Help",
        description: "Reached out to a friend when I was struggling",
        category: "social",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        impact: 9,
        isCompleted: true,
        tags: ["vulnerability", "friendship"],
      },
    ];
    setMilestones(sampleMilestones);
  }, []);

  const addMilestone = () => {
    if (!newMilestone.trim() || !newMilestoneDescription.trim()) return;

    const milestone: GrowthMilestone = {
      id: Date.now().toString(),
      title: newMilestone,
      description: newMilestoneDescription,
      category: selectedCategory,
      date: new Date(),
      impact: 5, // Default impact
      isCompleted: false,
      tags: [],
    };

    setMilestones(prev => [milestone, ...prev]);
    setNewMilestone("");
    setNewMilestoneDescription("");

    toast({
      title: "Milestone added",
      description: "Your growth journey continues...",
    });
  };

  const completeMilestone = (milestoneId: string) => {
    setMilestones(prev => prev.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, isCompleted: true }
        : milestone
    ));

    toast({
      title: "Milestone completed!",
      description: "You're growing stronger every day.",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emotional": return "from-pink-500/20 to-purple-500/20";
      case "academic": return "from-blue-500/20 to-indigo-500/20";
      case "social": return "from-green-500/20 to-emerald-500/20";
      case "personal": return "from-orange-500/20 to-yellow-500/20";
      default: return "from-gray-500/20 to-gray-600/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emotional": return Heart;
      case "academic": return BookOpen;
      case "social": return Star;
      case "personal": return Target;
      default: return Star;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.isCompleted).length;
  const averageImpact = milestones.length > 0 
    ? milestones.reduce((sum, m) => sum + m.impact, 0) / milestones.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Butterfly className="h-6 w-6 text-purple-400 animate-pulse" />
          <h2 className="text-2xl font-light text-white">Metamorphosis Tracker</h2>
          <Butterfly className="h-6 w-6 text-purple-400 animate-pulse" />
        </div>
        <p className="text-gray-300 text-sm">
          Track your journey of personal transformation...
        </p>
      </div>

      {/* Growth Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg border-purple-500/20 p-4">
          <div className="text-center space-y-2">
            <Target className="h-8 w-8 text-purple-300 mx-auto" />
            <h3 className="text-white font-medium">{totalMilestones}</h3>
            <p className="text-gray-300 text-sm">Total Milestones</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-lg border-green-500/20 p-4">
          <div className="text-center space-y-2">
            <Star className="h-8 w-8 text-green-300 mx-auto" />
            <h3 className="text-white font-medium">{completedMilestones}</h3>
            <p className="text-gray-300 text-sm">Completed</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-lg border-yellow-500/20 p-4">
          <div className="text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-yellow-300 mx-auto" />
            <h3 className="text-white font-medium">{averageImpact.toFixed(1)}</h3>
            <p className="text-gray-300 text-sm">Avg Impact</p>
          </div>
        </Card>
      </div>

      {/* Current Phase */}
      {currentPhase && (
        <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-lg border-blue-500/20 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Butterfly className="h-6 w-6 text-blue-300" />
                <h3 className="text-lg font-light text-white">{currentPhase.name}</h3>
              </div>
              <Badge className="bg-blue-500/20 text-blue-200">
                {currentPhase.progress}% Complete
              </Badge>
            </div>
            
            <p className="text-gray-300 text-sm">{currentPhase.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-blue-300">{currentPhase.progress}%</span>
              </div>
              <Progress value={currentPhase.progress} className="h-2" />
            </div>

            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Phase Milestones:</h4>
              <div className="space-y-1">
                {currentPhase.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add New Milestone */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-light text-white">Add Growth Milestone</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Milestone title..."
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              className="w-full bg-white/5 border border-white/20 text-white placeholder:text-gray-400 rounded-lg px-3 py-2"
            />
            
            <Textarea
              placeholder="Describe this moment of growth..."
              value={newMilestoneDescription}
              onChange={(e) => setNewMilestoneDescription(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={3}
            />

            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-white/5 border border-white/20 text-white rounded-lg px-3 py-2"
              >
                <option value="emotional">Emotional</option>
                <option value="academic">Academic</option>
                <option value="social">Social</option>
                <option value="personal">Personal</option>
              </select>
              
              <Button
                onClick={addMilestone}
                disabled={!newMilestone.trim() || !newMilestoneDescription.trim()}
                className="bg-purple-600/30 hover:bg-purple-600/50 text-white border border-purple-400/30"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones List */}
      <div className="space-y-4">
        <h3 className="text-lg font-light text-white">Your Growth Journey</h3>
        
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const CategoryIcon = getCategoryIcon(milestone.category);
            
            return (
              <Card 
                key={milestone.id}
                className={`bg-gradient-to-br ${getCategoryColor(milestone.category)} backdrop-blur-lg border-white/10 p-4 hover:bg-white/10 transition-all duration-300`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CategoryIcon className="h-5 w-5 text-white/70" />
                      <h4 className="text-white font-medium">{milestone.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-white/20 text-white text-xs">
                        Impact: {milestone.impact}/10
                      </Badge>
                      {milestone.isCompleted && (
                        <Badge className="bg-green-500/20 text-green-200 text-xs">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm">{milestone.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{getTimeAgo(milestone.date)}</span>
                    {!milestone.isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => completeMilestone(milestone.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 