import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Clock, Mail, Heart, Sparkles, Gift } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface TimeCapsule {
  id: string;
  content: string;
  deliveryDate: Date;
  type: "self" | "anonymous";
  mood: string;
  isDelivered: boolean;
  createdAt: Date;
}

export const TimeCapsules = () => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [newContent, setNewContent] = useState("");
  const [deliveryType, setDeliveryType] = useState<"self" | "anonymous">(
    "self",
  );
  const [deliveryTime, setDeliveryTime] = useState("");
  const [pendingDelivery, setPendingDelivery] = useState<TimeCapsule | null>(
    null,
  );
  const { toast } = useToast();

  const deliveryOptions = [
    { value: "1week", label: "1 week from now", days: 7 },
    { value: "1month", label: "1 month from now", days: 30 },
    { value: "3months", label: "3 months from now", days: 90 },
    { value: "6months", label: "6 months from now", days: 180 },
    { value: "1year", label: "1 year from now", days: 365 },
  ];

  useEffect(() => {
    // Load capsules from localStorage
    const saved = localStorage.getItem("time-capsules");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCapsules(
        parsed.map((capsule: TimeCapsule) => ({
          ...capsule,
          deliveryDate: new Date(capsule.deliveryDate),
          createdAt: new Date(capsule.createdAt),
        })),
      );
    }

    // Check for deliverable capsules
    checkDeliveries();
  }, []);

  const checkDeliveries = () => {
    const saved = localStorage.getItem("time-capsules");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    const now = new Date();

    const deliverable = parsed.find(
      (capsule: TimeCapsule) =>
        !capsule.isDelivered && new Date(capsule.deliveryDate) <= now,
    );

    if (deliverable) {
      setPendingDelivery({
        ...deliverable,
        deliveryDate: new Date(deliverable.deliveryDate),
        createdAt: new Date(deliverable.createdAt),
      });
    }
  };

  const createCapsule = () => {
    if (!newContent.trim() || !deliveryTime) return;

    const option = deliveryOptions.find((opt) => opt.value === deliveryTime);
    if (!option) return;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + option.days);

    const newCapsule: TimeCapsule = {
      id: Date.now().toString(),
      content: newContent,
      deliveryDate,
      type: deliveryType,
      mood: detectMood(newContent),
      isDelivered: false,
      createdAt: new Date(),
    };

    const updatedCapsules = [...capsules, newCapsule];
    setCapsules(updatedCapsules);
    localStorage.setItem("time-capsules", JSON.stringify(updatedCapsules));

    setNewContent("");
    setDeliveryTime("");

    toast({
      title: "Time capsule sealed",
      description: `Your ${deliveryType === "self" ? "future self" : "kindred spirit"} will receive this ${option.label}.`,
    });
  };

  const detectMood = (text: string): string => {
    const hopefulWords = /\b(hope|dream|future|better|grow|learn|grateful)\b/gi;
    const reflectiveWords = /\b(remember|think|feel|understand|realize)\b/gi;
    const encouragingWords = /\b(strong|brave|proud|love|believe|can)\b/gi;

    if (hopefulWords.test(text)) return "hopeful";
    if (encouragingWords.test(text)) return "encouraging";
    if (reflectiveWords.test(text)) return "reflective";
    return "thoughtful";
  };

  const openCapsule = () => {
    if (!pendingDelivery) return;

    // Mark as delivered
    const updatedCapsules = capsules.map((capsule) =>
      capsule.id === pendingDelivery.id
        ? { ...capsule, isDelivered: true }
        : capsule,
    );
    setCapsules(updatedCapsules);
    localStorage.setItem("time-capsules", JSON.stringify(updatedCapsules));
    setPendingDelivery(null);

    toast({
      title: "A message from the past",
      description: "Your words found their way back to you.",
    });
  };

  // Delivery Modal
  if (pendingDelivery) {
    return (
      <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-lg border-amber-400/20 p-8 text-center">
        <div className="space-y-6">
          <div className="relative">
            <Gift className="h-16 w-16 text-amber-300 mx-auto animate-pulse" />
            <div className="absolute -inset-6 bg-amber-400/20 rounded-full blur animate-pulse opacity-50"></div>
          </div>

          <div>
            <h3 className="text-2xl font-light text-white mb-2">
              A letter arrived
            </h3>
            <p className="text-amber-200 text-sm mb-2">
              From{" "}
              {pendingDelivery.type === "self"
                ? "yourself"
                : "a kindred spirit"}
            </p>
            <Badge className="bg-amber-500/20 text-amber-200 mb-6">
              {pendingDelivery.mood}
            </Badge>
          </div>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6 text-left">
            <p className="text-white leading-relaxed">
              {pendingDelivery.content}
            </p>
          </Card>

          <Button
            onClick={openCapsule}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl"
          >
            <Heart className="h-4 w-4 mr-2" />
            Received with gratitude
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Capsule */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-lg border-white/10 p-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-300 animate-pulse" />
            <h2 className="text-xl font-light text-white">
              Send to the Future
            </h2>
          </div>

          <p className="text-gray-300 text-sm">
            Write a letter to your future self or let someone unknown find
            comfort in your words.
          </p>

          <Textarea
            id="time-capsule-content"
            name="time-capsule-content"
            placeholder="What do you want to remember? What hope do you want to send forward?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none h-32 rounded-xl backdrop-blur-md focus:border-blue-400/50"
            maxLength={500}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={deliveryType}
              onValueChange={(value: "self" | "anonymous") =>
                setDeliveryType(value)
              }
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl">
                <SelectValue placeholder="Who should receive this?" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-white/20 backdrop-blur-lg">
                <SelectItem
                  value="self"
                  className="text-white focus:bg-white/10"
                >
                  My future self
                </SelectItem>
                <SelectItem
                  value="anonymous"
                  className="text-white focus:bg-white/10"
                >
                  Someone who needs it
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={deliveryTime} onValueChange={setDeliveryTime}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl">
                <SelectValue placeholder="When to deliver?" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-white/20 backdrop-blur-lg">
                {deliveryOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white focus:bg-white/10"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={createCapsule}
            disabled={!newContent.trim() || !deliveryTime}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
          >
            <Mail className="h-4 w-4 mr-2" />
            Seal & Send
          </Button>
        </div>
      </Card>

      {/* Pending Capsules */}
      {capsules.filter((c) => !c.isDelivered).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-light text-white">
            Traveling Through Time
          </h3>
          {capsules
            .filter((c) => !c.isDelivered)
            .map((capsule) => (
              <Card
                key={capsule.id}
                className="bg-white/5 backdrop-blur-lg border-white/10 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-500/20 text-blue-200 text-xs">
                        {capsule.mood}
                      </Badge>
                      <span className="text-gray-400 text-xs">
                        to{" "}
                        {capsule.type === "self"
                          ? "future you"
                          : "someone special"}
                      </span>
                    </div>
                    <p className="text-white text-sm line-clamp-2">
                      {capsule.content}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <div>Arrives</div>
                    <div>{capsule.deliveryDate.toLocaleDateString()}</div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};
