import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ShhhLine } from '../components/ShhhLine';

const Login: React.FC = () => {
  const { signInWithMagicLink, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const poeticSuccessLines = [
    "A whisper key has been sent to your inbox.",
    "The campus wind carries your secret key—check your email.",
    "A gentle invitation awaits in your inbox. Whisper forth.",
    "Your passage to the WhisperVerse is on its way."
  ];
  const poeticErrorLines = [
    "The wind could not carry your whisper. Try again.",
    "No echo returned—check your email and try once more.",
    "The gates remain closed. Only @cujammu.ac.in whispers may enter.",
    "Something blocked your whisper. Please try again."
  ];
  const [successLine, setSuccessLine] = useState('');
  const [errorLine, setErrorLine] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorLine('');
    setSuccessLine('');
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setError(error);
      setErrorLine(poeticErrorLines[Math.floor(Math.random() * poeticErrorLines.length)]);
      setSent(false);
    } else {
      setSuccessLine(poeticSuccessLines[Math.floor(Math.random() * poeticSuccessLines.length)]);
      setSent(true);
    }
  };

  return (
    <DreamLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40">
        <DreamHeader title="Sign In to WhisperVerse" subtitle="A poetic, anonymous campus sanctuary" />
        <div className="w-full max-w-md bg-paper-light rounded-xl shadow-soft p-8 mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <ShhhLine
                variant="ambient"
                context="login"
                emotion="hopeful"
                className="text-lg text-inkwell/80 italic"
              />
            </div>
            <label className="block text-inkwell font-medium mb-2" htmlFor="email">
              CUJ Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="yourid@cujammu.ac.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={sent || loading}
              className="mb-2"
            />
            {error && <div className="text-red-600 text-sm mb-2 italic">{errorLine}</div>}
            {sent ? (
              <div className="text-green-700 text-center font-medium animate-fade-in italic">
                {successLine}<br />
                <span className="text-green-800 text-sm">Check your email to continue.</span>
              </div>
            ) : (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            )}
          </form>
        </div>
      </div>
    </DreamLayout>
  );
};

export default Login; 