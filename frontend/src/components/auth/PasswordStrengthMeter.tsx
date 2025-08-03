import React from 'react';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import { dictionary } from '@zxcvbn-ts/language-common';
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned';

export interface PasswordStrengthMeterProps {
  password: string;
  minStrength?: number; // 0-4, where 0 is too guessable and 4 is very unguessable
  showStrengthText?: boolean;
  className?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  minStrength = 2,
  showStrengthText = true,
  className = '',
}) => {
  // Configure zxcvbn with common dictionary
  zxcvbnOptions.setOptions({
    dictionary: {
      ...dictionary,
    },
    // Add pwned matcher to check against breached passwords
    // This requires a backend endpoint that checks against the Pwned Passwords API
    // matcherPwnedFactory(fetch, zxcvbnOptions)
  });

  // Calculate password strength
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: -1, feedback: { suggestions: [], warning: '' } };
    
    const result = zxcvbn(pwd);
    return {
      score: result.score,
      feedback: {
        suggestions: result.feedback.suggestions,
        warning: result.feedback.warning,
      },
    };
  };

  const { score, feedback } = calculateStrength(password);
  const strengthPercentage = Math.min(100, Math.max(0, (score + 1) * 25));
  
  // Strength level descriptions
  const strengthTexts = [
    'Very weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ];
  
  // Color based on strength
  const getStrengthColor = (strength: number) => {
    const colors = [
      'bg-red-500',    // Very weak
      'bg-orange-500', // Weak
      'bg-yellow-500', // Fair
      'bg-blue-500',   // Good
      'bg-green-500',  // Strong
    ];
    return colors[Math.min(4, Math.max(0, strength + 1))];
  };

  // Check if password meets minimum strength requirement
  const isStrongEnough = score >= minStrength;

  return (
    <div className={`w-full ${className}`}>
      {/* Strength meter */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${getStrengthColor(score)}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      
      {/* Strength text and feedback */}
      <div className="text-xs text-gray-600">
        {showStrengthText && (
          <div className="flex justify-between mb-1">
            <span>Password strength: <span className="font-medium">{strengthTexts[score + 1]}</span></span>
            {!isStrongEnough && password.length > 0 && (
              <span className="text-red-500">Too weak (min: {strengthTexts[minStrength + 1]})</span>
            )}
          </div>
        )}
        
        {/* Password requirements */}
        <div className="mt-2 space-y-1">
          <div className={`flex items-center ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
            <span className="mr-1">•</span>
            <span>At least 8 characters</span>
          </div>
          <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
            <span className="mr-1">•</span>
            <span>At least one uppercase letter</span>
          </div>
          <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
            <span className="mr-1">•</span>
            <span>At least one lowercase letter</span>
          </div>
          <div className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
            <span className="mr-1">•</span>
            <span>At least one number</span>
          </div>
          <div className={`flex items-center ${/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
            <span className="mr-1">•</span>
            <span>At least one special character</span>
          </div>
        </div>
        
        {/* Additional feedback */}
        {feedback.warning && (
          <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 rounded text-xs">
            <p className="font-medium">Tip:</p>
            <p>{feedback.warning}</p>
            {feedback.suggestions.length > 0 && (
              <ul className="mt-1 list-disc list-inside">
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
