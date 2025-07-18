import React, { useState } from "react";
import { MessageCircle, Heart, Star, Sparkles, Quote } from "lucide-react";

interface Prompt {
  id: string;
  text: string;
  category: "poetic" | "humorous" | "senior" | "cultural" | "nostalgic";
  tone: string;
  usage: number;
  isFavorite: boolean;
}

const DogriHinglishPrompts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const prompts: Prompt[] = [
    // Poetic Prompts
    {
      id: "1",
      text: "Udaan ke baad ka scene? Sab log alag ho gaye...",
      category: "poetic",
      tone: "melancholic",
      usage: 45,
      isFavorite: true,
    },
    {
      id: "2",
      text: "Canteen ke chai mein bhi kahani hai",
      category: "poetic",
      tone: "philosophical",
      usage: 32,
      isFavorite: false,
    },
    {
      id: "3",
      text: "Tumne bhi banyan tree ke niche socha tha?",
      category: "poetic",
      tone: "contemplative",
      usage: 28,
      isFavorite: true,
    },
    {
      id: "4",
      text: "Hostel ki raat mein kya kya hua karta tha...",
      category: "poetic",
      tone: "nostalgic",
      usage: 38,
      isFavorite: false,
    },

    // Humorous Prompts
    {
      id: "5",
      text: "Mess ka khana dekh ke pet bhar gaya",
      category: "humorous",
      tone: "sarcastic",
      usage: 67,
      isFavorite: true,
    },
    {
      id: "6",
      text: "Professor ne question pucha, maine answer diya, sab has gaye",
      category: "humorous",
      tone: "self-deprecating",
      usage: 41,
      isFavorite: false,
    },
    {
      id: "7",
      text: "Library mein padhte padhte aankh lag gayi, ab kya hoga?",
      category: "humorous",
      tone: "exaggerated",
      usage: 53,
      isFavorite: true,
    },
    {
      id: "8",
      text: "Roommate ne meri chai pee li, ab dosti khatam",
      category: "humorous",
      tone: "dramatic",
      usage: 29,
      isFavorite: false,
    },

    // Senior Prompts
    {
      id: "9",
      text: "Freshers ko samjhane mein kitna maza aata hai",
      category: "senior",
      tone: "mentoring",
      usage: 34,
      isFavorite: true,
    },
    {
      id: "10",
      text: "Back in our days, Udaan was different...",
      category: "senior",
      tone: "nostalgic",
      usage: 26,
      isFavorite: false,
    },
    {
      id: "11",
      text: "Placement season mein sab tension mein hain",
      category: "senior",
      tone: "concerned",
      usage: 48,
      isFavorite: true,
    },
    {
      id: "12",
      text: "Final year mein kya kya miss kar rahe ho?",
      category: "senior",
      tone: "reflective",
      usage: 31,
      isFavorite: false,
    },

    // Cultural Prompts
    {
      id: "13",
      text: "Dogri mein baat karte hain, Hinglish mein likhte hain",
      category: "cultural",
      tone: "proud",
      usage: 22,
      isFavorite: true,
    },
    {
      id: "14",
      text: "Jammu ki sardi mein hostel ka heater chalta hai",
      category: "cultural",
      tone: "descriptive",
      usage: 35,
      isFavorite: false,
    },
    {
      id: "15",
      text: "CUJ ke campus mein kahan kahan ghooma hai?",
      category: "cultural",
      tone: "exploratory",
      usage: 27,
      isFavorite: true,
    },
    {
      id: "16",
      text: "Jammu ki local food vs mess ka khana",
      category: "cultural",
      tone: "comparative",
      usage: 44,
      isFavorite: false,
    },

    // Nostalgic Prompts
    {
      id: "17",
      text: "Pehle semester ki yaad aa rahi hai...",
      category: "nostalgic",
      tone: "sentimental",
      usage: 39,
      isFavorite: true,
    },
    {
      id: "18",
      text: "First day at CUJ, sab kuch naya tha",
      category: "nostalgic",
      tone: "reminiscent",
      usage: 33,
      isFavorite: false,
    },
    {
      id: "19",
      text: "Old friends se milne ka plan bana rahe hain",
      category: "nostalgic",
      tone: "hopeful",
      usage: 25,
      isFavorite: true,
    },
    {
      id: "20",
      text: "College life ke best moments yaad aa rahe hain",
      category: "nostalgic",
      tone: "grateful",
      usage: 36,
      isFavorite: false,
    },
  ];

  const categories = [
    {
      id: "all",
      name: "All Prompts",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    { id: "poetic", name: "Poetic", icon: <Heart className="w-4 h-4" /> },
    {
      id: "humorous",
      name: "Humorous",
      icon: <Sparkles className="w-4 h-4" />,
    },
    { id: "senior", name: "Senior Style", icon: <Star className="w-4 h-4" /> },
    { id: "cultural", name: "Cultural", icon: <Quote className="w-4 h-4" /> },
    { id: "nostalgic", name: "Nostalgic", icon: <Heart className="w-4 h-4" /> },
  ];

  const filteredPrompts = prompts.filter((prompt) => {
    if (favoritesOnly && !prompt.isFavorite) return false;
    if (selectedCategory !== "all" && prompt.category !== selectedCategory)
      return false;
    return true;
  });

  const toggleFavorite = (promptId: string) => {
    // In a real app, this would update the backend
  };

  return (
    <div className="whisper-orb floating-orb p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="kinetic-text text-3xl font-bold whisper-gradient-text mb-4">
          Dogri-Hinglish Prompt Library v2
        </h2>
        <p className="kinetic-text-slow text-gray-300 max-w-2xl mx-auto">
          Expanded CUJ prompt libraries with poetic, humorous, and senior-style
          tones. Cultural context meets emotional expression.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
              ${
                selectedCategory === category.id
                  ? "whisper-button-3d text-white"
                  : "whisper-glass text-gray-300 hover:text-white"
              }
            `}
            aria-label={`Select category ${category.name}`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}

        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
            ${
              favoritesOnly
                ? "whisper-button-3d text-white"
                : "whisper-glass text-gray-300 hover:text-white"
            }
          `}
          aria-label={favoritesOnly ? "Show all prompts" : "Show only favorites"}
        >
          <Heart className={`w-4 h-4 ${favoritesOnly ? "fill-current" : ""}`} />
          Favorites
        </button>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className={`
              whisper-orb p-6 rounded-2xl transition-all duration-300 cursor-pointer
              hover:scale-105 hover:shadow-whisper-glow-primary
              ${prompt.isFavorite ? "ring-2 ring-purple-400/50" : ""}
            `}
            onClick={() => toggleFavorite(prompt.id)}
          >
            {/* Prompt Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`
                  text-xs px-2 py-1 rounded-full capitalize
                  ${
                    prompt.category === "poetic"
                      ? "bg-pink-500/20 text-pink-300"
                      : prompt.category === "humorous"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : prompt.category === "senior"
                          ? "bg-blue-500/20 text-blue-300"
                          : prompt.category === "cultural"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-purple-500/20 text-purple-300"
                  }
                `}
                >
                  {prompt.category}
                </span>
                {prompt.isFavorite && (
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {prompt.usage}
                </div>
                <div className="text-xs text-gray-400">uses</div>
              </div>
            </div>

            {/* Prompt Text */}
            <p className="text-white mb-4 leading-relaxed">"{prompt.text}"</p>

            {/* Prompt Footer */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 capitalize">{prompt.tone}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Copy to clipboard
                  navigator.clipboard.writeText(prompt.text);
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Stats */}
      <div className="mt-8 whisper-glass p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          Prompt Usage Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {prompts.length}
            </div>
            <div className="text-sm text-gray-400">Total Prompts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {prompts.filter((p) => p.isFavorite).length}
            </div>
            <div className="text-sm text-gray-400">Favorites</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {Math.round(
                prompts.reduce((sum, p) => sum + p.usage, 0) / prompts.length,
              )}
            </div>
            <div className="text-sm text-gray-400">Avg Usage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {prompts.reduce((sum, p) => sum + p.usage, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Uses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogriHinglishPrompts;
