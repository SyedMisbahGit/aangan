import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Heart, Sparkles, Clock, Eye, Home, Music, BookOpen, Users, Star, MessageCircle } from 'lucide-react';

interface NarrativeTemplate {
  id: string;
  title: string;
  starter: string;
  category: 'senior-advice' | 'cuj-memories' | 'cultural-stories' | 'life-lessons';
  icon: any;
  color: string;
  culturalContext: string;
}

const CUJNarrativeTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<NarrativeTemplate | null>(null);
  const [narrative, setNarrative] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNarratives, setSubmittedNarratives] = useState<any[]>([]);

  const narrativeTemplates: NarrativeTemplate[] = [
    {
      id: '1',
      title: 'From a CUJ Senior...',
      starter: 'If I could talk to my fresher self...',
      category: 'senior-advice',
      icon: GraduationCap,
      color: 'text-primary',
      culturalContext: 'Senior wisdom for freshers'
    },
    {
      id: '2',
      title: 'One thing I wish I knew...',
      starter: 'One thing I wish I knew before joining CUJ...',
      category: 'senior-advice',
      icon: Heart,
      color: 'text-secondary',
      culturalContext: 'Pre-CUJ knowledge'
    },
    {
      id: '3',
      title: 'This happened outside Udaan...',
      starter: 'This happened outside Udaan. I never forgot...',
      category: 'cuj-memories',
      icon: Music,
      color: 'text-accent',
      culturalContext: 'Udaan festival memories'
    },
    {
      id: '4',
      title: 'Hostel ki raat mein...',
      starter: 'Hostel ki raat mein koi aisa moment...',
      category: 'cuj-memories',
      icon: Home,
      color: 'text-yellow-500',
      culturalContext: 'Hostel night stories'
    },
    {
      id: '5',
      title: 'Lab ke baad...',
      starter: 'Lab ke baad thakan wali feeling...',
      category: 'life-lessons',
      icon: BookOpen,
      color: 'text-purple-500',
      culturalContext: 'Lab experiences'
    },
    {
      id: '6',
      title: 'Canteen corner memories...',
      starter: 'Canteen corner mein koi aisa din...',
      category: 'cuj-memories',
      icon: Users,
      color: 'text-green-500',
      culturalContext: 'Canteen conversations'
    },
    {
      id: '7',
      title: 'Library silence drop...',
      starter: 'Library silence drop mein kya sochte ho...',
      category: 'life-lessons',
      icon: BookOpen,
      color: 'text-blue-500',
      culturalContext: 'Library reflections'
    },
    {
      id: '8',
      title: 'Exam fog experience...',
      starter: 'Exam fog mein kya pressure feel karte ho...',
      category: 'life-lessons',
      icon: Clock,
      color: 'text-red-500',
      culturalContext: 'Exam stress'
    },
    {
      id: '9',
      title: 'Fresher to senior journey...',
      starter: 'Fresher se senior tak ka safar...',
      category: 'senior-advice',
      icon: Star,
      color: 'text-indigo-500',
      culturalContext: 'Growth journey'
    },
    {
      id: '10',
      title: 'Campus ka sabse yaadgar din...',
      starter: 'Campus ka sabse yaadgar din kya tha...',
      category: 'cuj-memories',
      icon: Heart,
      color: 'text-pink-500',
      culturalContext: 'Memorable campus day'
    },
  ];

  const categories = {
    'senior-advice': { label: 'Senior Advice', icon: GraduationCap, color: 'bg-primary/20 text-primary' },
    'cuj-memories': { label: 'CUJ Memories', icon: Heart, color: 'bg-secondary/20 text-secondary' },
    'cultural-stories': { label: 'Cultural Stories', icon: Music, color: 'bg-accent/20 text-accent' },
    'life-lessons': { label: 'Life Lessons', icon: BookOpen, color: 'bg-purple-500/20 text-purple-500' },
  };

  const handleTemplateSelect = (template: NarrativeTemplate) => {
    setSelectedTemplate(template);
    setNarrative(template.starter + ' ');
  };

  const handleSubmit = async () => {
    if (!narrative.trim() || !selectedTemplate) return;

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newNarrative = {
      id: Date.now().toString(),
      content: narrative,
      template: selectedTemplate,
      timestamp: new Date(),
      isAnonymous: true,
    };

    setSubmittedNarratives(prev => [newNarrative, ...prev.slice(0, 4)]);
    setNarrative('');
    setSelectedTemplate(null);
    setIsSubmitting(false);
  };

  const getCategoryData = (category: string) => {
    return categories[category as keyof typeof categories];
  };

  return (
    <div className="space-y-6 p-6">
      {/* CUJ Narrative Templates Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <GraduationCap className="h-6 w-6" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CUJ Narrative Templates
          </h2>
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          CUJ seniors ki stories, memories, aur wisdom share karo
        </p>
      </div>

      {/* Template Categories */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            Template Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg border ${category.color} flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card className="glass border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <MessageCircle className="h-5 w-5" />
            Choose Your Story Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {narrativeTemplates.map((template) => {
              const Icon = template.icon;
              const categoryData = getCategoryData(template.category);
              const CategoryIcon = categoryData.icon;
              
              return (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-muted/30 bg-muted/5 hover:border-primary/30'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 ${template.color}`} />
                    <span className="font-medium text-sm">{template.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    "{template.starter}"
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {categoryData.label}
                    </Badge>
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {template.culturalContext}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Narrative Writing */}
      {selectedTemplate && (
        <Card className="glass border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Eye className="h-5 w-5" />
              Write Your Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-sm text-muted-foreground">
                <strong>Template:</strong> {selectedTemplate.title}
              </p>
              <p className="text-sm text-muted-foreground italic mt-1">
                "{selectedTemplate.starter}"
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Apni story likho..."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="min-h-[150px] resize-none glass"
              />
              <p className="text-xs text-muted-foreground">
                {narrative.length}/1000 characters
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!narrative.trim() || isSubmitting}
              className="w-full glass"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Story share kar raha hun...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Share Your Story
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Stories */}
      {submittedNarratives.length > 0 && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5" />
              Recent Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedNarratives.map((story) => {
                const TemplateIcon = story.template.icon;
                const categoryData = getCategoryData(story.template.category);
                const CategoryIcon = categoryData.icon;
                
                return (
                  <div
                    key={story.id}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TemplateIcon className={`h-4 w-4 ${story.template.color}`} />
                        <span className="font-medium text-sm">{story.template.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {story.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{story.content}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {categoryData.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {story.template.culturalContext}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CUJNarrativeTemplates; 