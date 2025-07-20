import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Copy, Mail, Users, Clock, Shield } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

export const InviteSystem = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateInviteCode = async () => {
    setIsGenerating(true);

    // Simulate encrypted token generation
    setTimeout(() => {
      const code = `SHHH${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setGeneratedCode(code);
      setIsGenerating(false);

      toast({
        title: "Invite Code Generated",
        description: "Share this code carefully. It expires after one use.",
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  const validateInvite = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid invite code.",
        variant: "destructive",
      });
      return;
    }

    // Simulate validation
    toast({
      title: "Code Verified",
      description: "Welcome to Shhh! Your campus access has been granted.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Campus Verification */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-white">Campus Verification</h3>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
            Zero Data Stored
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-200 text-sm">
              Enter your college email for one-time verification. We'll send an
              OTP and immediately forget your email address.
            </p>
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="your-email@college.edu"
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Send OTP</Button>
          </div>
        </div>
      </Card>

      {/* Invite Code Entry */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-green-400" />
          <h3 className="font-bold text-white">Join with Invite Code</h3>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter invite code..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={validateInvite}
              className="bg-green-600 hover:bg-green-700"
            >
              Verify
            </Button>
          </div>
        </div>
      </Card>

      {/* Generate Invite */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-purple-400" />
          <h3 className="font-bold text-white">Invite Someone</h3>
          <Badge
            variant="secondary"
            className="bg-yellow-500/20 text-yellow-200"
          >
            Limited Use
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center space-x-2 text-yellow-200 text-sm">
              <Clock className="h-4 w-4" />
              <span>Each code expires after one use or 24 hours</span>
            </div>
          </div>

          <Button
            onClick={generateInviteCode}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating
              ? "Generating Secure Code..."
              : "Generate Invite Code"}
          </Button>

          {generatedCode && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 font-mono text-lg">
                    {generatedCode}
                  </p>
                  <p className="text-green-300 text-xs">
                    Share this code carefully
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedCode)}
                  className="text-green-400 hover:text-green-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
