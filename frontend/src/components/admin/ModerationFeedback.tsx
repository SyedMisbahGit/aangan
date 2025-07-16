import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface ModerationFeedbackProps {
  postId?: string;
  moderationResult?: {
    action: "approved" | "flagged" | "removed";
    confidence: number;
    reason?: string;
    suggestions?: string[];
  };
}

export const ModerationFeedback = ({
  postId,
  moderationResult,
}: ModerationFeedbackProps) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const getStatusIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "removed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (action: string) => {
    switch (action) {
      case "approved":
        return "bg-green-500/20 text-green-200";
      case "flagged":
        return "bg-yellow-500/20 text-yellow-200";
      case "removed":
        return "bg-red-500/20 text-red-200";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
  };

  if (!moderationResult) return null;

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 mt-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(moderationResult.action)}
            <Badge className={getStatusColor(moderationResult.action)}>
              {moderationResult.action.charAt(0).toUpperCase() +
                moderationResult.action.slice(1)}
            </Badge>
            <span className="text-xs text-gray-400">
              Confidence: {Math.round(moderationResult.confidence * 100)}%
            </span>
          </div>
        </div>

        {moderationResult.reason && (
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-200 text-sm">{moderationResult.reason}</p>
          </div>
        )}

        {moderationResult.suggestions &&
          moderationResult.suggestions.length > 0 && (
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-200 text-sm font-medium mb-2">
                Suggestions:
              </p>
              <ul className="text-purple-200 text-sm space-y-1">
                {moderationResult.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

        {moderationResult.action === "approved" && (
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-gray-400 text-xs">
              How was this experience?
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback("positive")}
              className={`h-8 px-2 ${feedback === "positive" ? "text-green-400" : "text-gray-400"}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback("negative")}
              className={`h-8 px-2 ${feedback === "negative" ? "text-red-400" : "text-gray-400"}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
