import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, Users, Heart, CheckCircle } from 'lucide-react';

interface PrivacyPromiseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPromise: React.FC<PrivacyPromiseProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(40, 38, 55, 0.18)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">
                Aangan's Privacy Promise
              </CardTitle>
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your privacy is not just a feature—it's the foundation of everything we do. 
              Here's our commitment to protecting your anonymity and keeping your thoughts safe.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Privacy Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">No Login Required</h3>
                  <p className="text-sm text-gray-600">We don't ask for your name, email, or any personal information.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Lock className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Local Guest ID</h3>
                  <p className="text-sm text-gray-600">Your guest ID is stored only on your device using localStorage.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Encrypted Storage</h3>
                  <p className="text-sm text-gray-600">All whispers are encrypted before being stored in our database.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Admin Privacy</h3>
                  <p className="text-sm text-gray-600">Admins can only see aggregate statistics, not individual users.</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg"
              >
                I Understand & Trust Aangan
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}; 