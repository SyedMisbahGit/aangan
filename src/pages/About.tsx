import React from "react";
import { motion } from "framer-motion";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";

const About: React.FC = () => {
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
      </motion.div>
    </DreamLayout>
  );
};

export default About; 