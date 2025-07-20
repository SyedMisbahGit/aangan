import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Lock, Flame, Key, Sparkles } from "lucide-react";

interface LockedWhisper {
  id: string;
  content: string;
  timestamp: Date;
  action: "lock-forever" | "burn-after-reading";
  burned?: boolean;
}

export const LockedWhispers = () => {
  const [currentWhisper, setCurrentWhisper] = useState("");
  const [selectedAction, setSelectedAction] = useState<
    "lock-forever" | "burn-after-reading" | null
  >(null);
  const [lockedWhispers, setLockedWhispers] = useState<LockedWhisper[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);

  useEffect(() => {
    // Load stored locked whispers and unlocked themes
    const stored = localStorage.getItem("whisper-locked-entries");
    if (stored) {
      const parsed = JSON.parse(stored).map((entry: LockedWhisper) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
      setLockedWhispers(parsed);
    }

    const themes = localStorage.getItem("whisper-unlocked-themes");
    if (themes) {
      setUnlockedThemes(JSON.parse(themes));
    }
  }, []);

  const handleLockWhisper = () => {
    if (!currentWhisper.trim() || !selectedAction) return;

    const newWhisper: LockedWhisper = {
      id: Date.now().toString(),
      content: currentWhisper,
      timestamp: new Date(),
      action: selectedAction,
    };

    const updatedWhispers = [newWhisper, ...lockedWhispers];
    setLockedWhispers(updatedWhispers);

    // Store in localStorage
    localStorage.setItem(
      "whisper-locked-entries",
      JSON.stringify(updatedWhispers),
    );

    // Unlock themes based on action
    const newTheme =
      selectedAction === "lock-forever" ? "Sacred Vault" : "Phoenix Ashes";
    if (!unlockedThemes.includes(newTheme)) {
      const updatedThemes = [...unlockedThemes, newTheme];
      setUnlockedThemes(updatedThemes);
      localStorage.setItem(
        "whisper-unlocked-themes",
        JSON.stringify(updatedThemes),
      );
    }

    setCurrentWhisper("");
    setSelectedAction(null);
    setShowConfirmation(true);

    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const handleBurnWhisper = (id: string) => {
    const updatedWhispers = lockedWhispers.map((whisper) =>
      whisper.id === id ? { ...whisper, burned: true } : whisper,
    );
    setLockedWhispers(updatedWhispers);
    localStorage.setItem(
      "whisper-locked-entries",
      JSON.stringify(updatedWhispers),
    );
  };

  const getActionIcon = (action: string) => {
    return action === "lock-forever" ? Lock : Flame;
  };

  const getActionColor = (action: string) => {
    return action === "lock-forever"
      ? "text-blue-300 border-blue-400/30 bg-blue-500/20"
      : "text-orange-300 border-orange-400/30 bg-orange-500/20";
  };

  if (showConfirmation) {
    return (
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Sparkles className="h-8 w-8 text-purple-300 animate-pulse" />
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium text-lg">
              Sacred Act Complete
            </h3>
            <p className="text-purple-200">
              Your whisper has been{" "}
              {selectedAction === "lock-forever"
                ? "locked away forever"
                : "prepared for burning"}
            </p>
            <p className="text-gray-400 text-sm">
              Theme unlocked: "
              {selectedAction === "lock-forever"
                ? "Sacred Vault"
                : "Phoenix Ashes"}
              "
            </p>
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
          <Lock className="h-6 w-6 text-purple-300 animate-pulse" />
          <div>
            <h3 className="text-white font-medium">Locked Whispers</h3>
            <p className="text-gray-400 text-sm">
              For secrets never meant to be shared
            </p>
          </div>
        </div>

        {/* Writing Space */}
        <div className="space-y-4">
          <Textarea
            value={currentWhisper}
            onChange={(e) => setCurrentWhisper(e.target.value)}
            placeholder="Write what can never be said aloud..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-400 min-h-[120px] resize-none focus:ring-purple-400/50"
          />

          {/* Action Selection */}
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">Choose its fate:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedAction("lock-forever")}
                className={`p-4 h-auto flex-col space-y-2 transition-all ${
                  selectedAction === "lock-forever"
                    ? "bg-blue-500/20 border-blue-400/30 text-blue-200"
                    : "text-gray-400 hover:text-blue-300 hover:bg-blue-500/10"
                }`}
              >
                <Lock className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">Lock Forever</div>
                  <div className="text-xs opacity-70">Sealed in silence</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => setSelectedAction("burn-after-reading")}
                className={`p-4 h-auto flex-col space-y-2 transition-all ${
                  selectedAction === "burn-after-reading"
                    ? "bg-orange-500/20 border-orange-400/30 text-orange-200"
                    : "text-gray-400 hover:text-orange-300 hover:bg-orange-500/10"
                }`}
              >
                <Flame className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">Burn After Reading</div>
                  <div className="text-xs opacity-70">Release into ashes</div>
                </div>
              </Button>
            </div>
          </div>

          <Button
            onClick={handleLockWhisper}
            disabled={!currentWhisper.trim() || !selectedAction}
            className="w-full bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white"
          >
            <Key className="h-4 w-4 mr-2" />
            Seal This Secret
          </Button>
        </div>

        {/* Locked Whispers Archive */}
        {lockedWhispers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium">
              Your Sealed Secrets
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lockedWhispers
                .filter((w) => !w.burned)
                .map((whisper) => {
                  const ActionIcon = getActionIcon(whisper.action);
                  return (
                    <div
                      key={whisper.id}
                      className={`rounded-lg p-3 border backdrop-blur-md ${getActionColor(whisper.action)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ActionIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {whisper.action === "lock-forever"
                              ? "Forever Locked"
                              : "Ready to Burn"}
                          </span>
                        </div>
                        {whisper.action === "burn-after-reading" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBurnWhisper(whisper.id)}
                            className="text-orange-300 hover:text-orange-100 hover:bg-orange-500/20"
                          >
                            <Flame className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        Sealed{" "}
                        {new Date(whisper.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Unlocked Themes */}
        {unlockedThemes.length > 0 && (
          <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-md">
            <p className="text-purple-200 text-sm">
              Unlocked Themes: {unlockedThemes.join(", ")}
            </p>
          </div>
        )}

        {/* Note */}
        <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-md">
          <p className="text-gray-300 text-sm leading-relaxed">
            Some thoughts are meant to be held, others released. This page is
            locked, but your feelings aren't.
          </p>
        </div>
      </div>
    </Card>
  );
};
