import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  TestTube,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";

interface ModerationTest {
  id: string;
  content: string;
  result: {
    action: "approved" | "flagged" | "removed";
    confidence: number;
    flags: string[];
    culturalContext?: string;
  };
}

export const ModerationSandbox = () => {
  const [testContent, setTestContent] = useState("");
  const [testResults, setTestResults] = useState<ModerationTest[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleTests = [
    "Bhai kal ki attendance phir se gayi, ab kya karu?",
    "Anjali from CSE ke saath date pe gaya tha",
    "Bohot thak gaya hun sabse, kuch kar baithunga aaj",
    "Prof ka behavior bohot chhapri hai yaar",
    "Placement ke liye bohot tension ho rahi hai",
  ];

  const analyzeCulturalContent = (text: string) => {
    const flags = [];
    let action: "approved" | "flagged" | "removed" = "approved";
    let confidence = 0.95;
    let culturalContext = "";

    // PII Detection (Hindi/English)
    const namePattern =
      /\b[A-Z][a-z]+\s+(from|se|ka|ki|CSE|ECE|ME|Civil|IT)\b/gi;
    if (namePattern.test(text)) {
      flags.push("Identity exposure risk");
      action = "flagged";
      confidence = 0.88;
    }

    // Hindi mental health signals
    const distressSignals =
      /\b(thak gaya|kar baithunga|mar jaana|khatam kar|zinda nahi)\b/gi;
    if (distressSignals.test(text)) {
      flags.push("Mental health concern detected");
      action = "flagged";
      confidence = 0.92;
      culturalContext =
        "Hindi expression of distress - requires mental health protocol";
    }

    // Hinglish slang detection
    const slangWords = /\b(chhapri|fattu|bakchodi|chutiya|bhadwa)\b/gi;
    if (slangWords.test(text)) {
      if (text.includes("chhapri")) {
        culturalContext =
          "'Chhapri' - colloquial term, context-dependent offensiveness";
        action = "flagged";
        flags.push("Potentially offensive slang");
      } else {
        flags.push("Strong language detected");
        action = "removed";
        confidence = 0.85;
      }
    }

    // Academic stress patterns
    const academicStress =
      /\b(attendance|placement|exam|marks|tension|stress|prof)\b/gi;
    if (academicStress.test(text) && !flags.length) {
      culturalContext =
        "Academic stress expression - common during exam/placement season";
    }

    // Positive hinglish expressions
    const positiveHinglish =
      /\b(mast|bindaas|dhinchak|solid|kamaal|badhiya)\b/gi;
    if (positiveHinglish.test(text)) {
      culturalContext = "Positive Hinglish expression";
      confidence = 0.98;
    }

    return {
      action,
      confidence,
      flags,
      culturalContext,
    };
  };

  const handleAnalyze = () => {
    if (!testContent.trim()) return;

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const result = analyzeCulturalContent(testContent);

      const newTest: ModerationTest = {
        id: Date.now().toString(),
        content: testContent,
        result,
      };

      setTestResults((prev) => [newTest, ...prev]);
      setTestContent("");
      setIsAnalyzing(false);
    }, 1500);
  };

  const runSampleTest = (sample: string) => {
    setTestContent(sample);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-200";
      case "flagged":
        return "bg-yellow-500/20 text-yellow-200";
      case "removed":
        return "bg-red-500/20 text-red-200";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "removed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Brain className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="relative">
          <TestTube className="h-6 w-6 text-cyan-400" />
          <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur animate-pulse"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            Moderation Laboratory
          </h2>
          <p className="text-cyan-300 text-sm">
            Test cultural AI understanding • Hindi-English detection
          </p>
        </div>
      </div>

      {/* Test Input */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-4">
          <Textarea
            id="moderation-test-content"
            name="moderation-test-content"
            placeholder="Test content for cultural moderation... Try: 'Bhai placement ke liye bohot tension hai' or 'Anjali from CSE ko message kiya'"
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none h-24"
          />

          <div className="flex items-center justify-between">
            <Button
              onClick={handleAnalyze}
              disabled={!testContent.trim() || isAnalyzing}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Test Moderation"}
            </Button>

            <div className="text-sm text-gray-400">
              {testContent.length} characters
            </div>
          </div>
        </div>
      </Card>

      {/* Sample Tests */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Quick Test Samples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleTests.map((sample, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => runSampleTest(sample)}
              className="text-left justify-start text-sm text-gray-300 hover:text-white hover:bg-white/10 p-3"
            >
              "{sample}"
            </Button>
          ))}
        </div>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Test Results</h3>
        {testResults.map((test) => (
          <Card
            key={test.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getActionColor(test.result.action)}>
                  {getActionIcon(test.result.action)}
                  <span className="ml-1">
                    {test.result.action.toUpperCase()}
                  </span>
                </Badge>
                <span className="text-sm text-gray-400">
                  Confidence: {Math.round(test.result.confidence * 100)}%
                </span>
              </div>

              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-blue-200">"{test.content}"</p>
              </div>

              {test.result.flags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white text-sm font-medium">
                    Detected Issues:
                  </p>
                  {test.result.flags.map((flag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-400" />
                      <span className="text-yellow-200 text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              )}

              {test.result.culturalContext && (
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-purple-200 text-sm">
                    <strong>Cultural Context:</strong>{" "}
                    {test.result.culturalContext}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
