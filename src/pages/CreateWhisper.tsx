import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DreamComposer } from "@/components/whisper/DreamComposer";
import { DreamLayout } from "@/components/shared/DreamLayout";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Sparkles } from "lucide-react";

const CreateWhisper: React.FC = () => {
  const navigate = useNavigate();
  const [isComposerOpen, setIsComposerOpen] = useState(true);

  const handleSubmit = (content: string, emotion: string) => {
    console.log("New whisper:", { content, emotion });
    // TODO: Implement whisper submission
    setIsComposerOpen(false);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  const handleClose = () => {
    setIsComposerOpen(false);
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  return (
    <DreamLayout showPadding={false}>
      <div className="dream-container">
      <motion.div
          initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          className="dream-header"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-dream-text-secondary hover:text-dream-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <h1 className="dream-title flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-dream-primary" />
            Share a Whisper
          </h1>
          <p className="dream-subtitle">
            Your thoughts are safe here
          </p>
          </motion.div>

        <DreamComposer
          isOpen={isComposerOpen}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />

        {/* Fallback content when composer is closed */}
        {!isComposerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dream-card p-6 text-center"
          >
            <Sparkles className="h-12 w-12 text-dream-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dream-text-primary mb-2">
              Whisper Sent
            </h3>
            <p className="text-dream-text-secondary">
              Your whisper has been shared with the community
            </p>
          </motion.div>
        )}
    </div>
    </DreamLayout>
  );
};

export default CreateWhisper;
