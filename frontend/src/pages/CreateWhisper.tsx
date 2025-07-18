import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AanganHeader } from "@/components/shared/DreamHeader";
import { useWhispers } from "@/contexts/WhispersContext";
import { useShhhNarrator } from "@/contexts/ShhhNarratorContext";
import { useCUJHotspots } from "@/contexts/CUJHotspotContext";
import { useToast } from "@/hooks/use-toast";

const CreateWhisper: React.FC = () => {
  const navigate = useNavigate();
  const { addWhisper } = useWhispers();
  const { generateLine } = useShhhNarrator();
  const { getHotspotById } = useCUJHotspots();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("");
  const [location, setLocation] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emotions = [
    { id: "joy", label: "Joy", icon: "✨" },
    { id: "calm", label: "Calm", icon: "🌊" },
    { id: "nostalgia", label: "Nostalgia", icon: "🌸" },
    { id: "hope", label: "Hope", icon: "🌱" },
    { id: "anxiety", label: "Anxiety", icon: "💭" },
    { id: "loneliness", label: "Loneliness", icon: "🌙" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !emotion) {
      toast({
        title: "Missing information",
        description: "Please fill in your whisper and select an emotion.",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Get guestId from localStorage
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') || undefined : undefined;
    // Simulate API call
    setTimeout(async () => {
      const newWhisper = {
        id: Date.now().toString(),
        content: content.trim(),
        emotion,
        timestamp: new Date().toISOString(),
        location: location || "campus",
        likes: 0,
        comments: 0,
        isAnonymous,
        tags: [],
        guestId,
      };

      addWhisper(newWhisper);
      
      // Generate a poetic line using the narrator
      let poeticLine = "Your whisper has been sent to the courtyard. May it find kindred spirits.";
      try {
        poeticLine = await generateLine(location, emotion, undefined, "general");
      } catch (err) {
        // Ignore errors in poetic line generation
      }
      
      toast({
        title: "Whisper sent!",
        description: poeticLine,
      });

      navigate("/");
    }, 1000);
  };

  return (
    <div className="aangan-container">
      <AanganHeader 
        title="Create Whisper"
        subtitle="Share your thoughts with the courtyard"
        className="aangan-header"
      />
      
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-aangan-text-secondary hover:text-aangan-text-primary transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="aangan-title flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-aangan-primary" />
          New Whisper
        </h1>
        <p className="aangan-subtitle">
          Let your thoughts find their voice in the courtyard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-aangan-text-primary mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, feelings, or experiences..."
              className="aangan-input w-full h-32 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-aangan-text-muted mt-1 text-right">
              {content.length}/500
            </div>
          </div>

          {/* Emotion Selection */}
          <div>
            <label className="block text-sm font-medium text-aangan-text-primary mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {emotions.map((emotionOption) => (
                <button
                  key={emotionOption.id}
                  type="button"
                  onClick={() => setEmotion(emotionOption.id)}
                  className={`aangan-card p-4 text-center transition-all duration-200 ${
                    emotion === emotionOption.id
                      ? "ring-2 ring-aangan-primary bg-aangan-primary/5"
                      : "hover:bg-aangan-surface"
                  }`}
                >
                  <div className="text-2xl mb-2">{emotionOption.icon}</div>
                  <div className="text-sm font-medium text-aangan-text-primary">
                    {emotionOption.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-aangan-text-primary mb-2">
              Where are you? (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., library, canteen, hostel..."
              aria-label="Location (optional)"
              className="aangan-input w-full"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-aangan-text-primary">
                Post anonymously
              </label>
              <p className="text-xs text-aangan-text-muted">
                Your identity will be hidden from other users
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnonymous ? "bg-aangan-primary" : "bg-aangan-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnonymous ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || !emotion}
            className="aangan-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Whisper
              </>
            )}
          </button>
        </form>

        {/* Empty State */}
        {!content && !emotion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aangan-card p-6 text-center"
          >
            <Sparkles className="h-12 w-12 text-aangan-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-aangan-text-primary mb-2">
              Ready to whisper?
            </h3>
            <p className="text-aangan-text-secondary">
              Share your thoughts and let them find their way to kindred spirits in the courtyard.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreateWhisper;