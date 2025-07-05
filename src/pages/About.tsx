import React, { useState } from "react";
import { motion } from "framer-motion";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Button } from "../components/ui/button";
import { Shield } from "lucide-react";
import { PrivacyPromise } from "../components/shared/PrivacyPromise";

const About: React.FC = () => {
  const [showPrivacyPromise, setShowPrivacyPromise] = useState(false);
  
  return (
    <DreamLayout>
      <DreamHeader title="About Aangan" subtitle="Yeh aangan tum sab ka hai..." />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-6 text-[15px] leading-relaxed text-neutral-700 space-y-4"
      >
        <p>
          <strong>Aangan</strong> is a courtyard of anonymous thoughts, emotions, and whispers —
          a space to feel seen without showing your face.
        </p>
        <p>
          Inspired by the warmth of Indian homes and the echo of shared silence,
          Aangan brings students together — not through profiles, but through
          presence, emotion, and honesty.
        </p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="italic text-neutral-500 text-center text-lg mt-8"
        >
          "Koi sunega… zaroor."
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 p-4 bg-cream-50 rounded-lg border border-cream-200"
        >
          <h3 className="font-semibold text-dream-blue mb-2">Privacy Promise</h3>
          <p className="text-sm text-inkwell-80">
            Aangan stores <strong>no personal data</strong>. Your whispers are anonymous, 
            your emotions are private, and your identity remains yours alone. 
            We believe in the power of honest expression without the burden of recognition.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivacyPromise(true)}
            className="flex items-center gap-2 mt-3"
          >
            <Shield className="w-3 h-3" />
            Read Full Privacy Promise
          </Button>
        </motion.div>
      </motion.div>

      {/* Privacy Promise Modal */}
      <PrivacyPromise 
        isOpen={showPrivacyPromise} 
        onClose={() => setShowPrivacyPromise(false)} 
      />
    </DreamLayout>
  );
};

export default About; 