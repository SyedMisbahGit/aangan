import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';

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

const Login: React.FC = () => {
  const { signInWithMagicLink, loading, user } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [successLine, setSuccessLine] = useState('');
  const [errorLine, setErrorLine] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-focus email input
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    // Magic-link callback handling
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'magiclink' && user) {
      // If already signed in, redirect
      if (user.email === 'nocodeai007@gmail.com') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
    // Optionally, handle oobCode/mode for other providers
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLine('');
    setSuccessLine('');
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setErrorLine(poeticErrorLines[Math.floor(Math.random() * poeticErrorLines.length)]);
      setSent(false);
    } else {
      setSuccessLine(poeticSuccessLines[Math.floor(Math.random() * poeticSuccessLines.length)]);
      setSent(true);
    }
  };

  return (
    <DreamLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 dark:bg-dream-dark-bg transition-colors duration-500">
        <DreamHeader
          title="Sign In to Aangan"
          subtitle="A poetic, anonymous campus sanctuary"
          className="mb-2"
        />
        <div className="w-full max-w-md bg-paper-light dark:bg-dream-dark-card rounded-2xl shadow-soft p-8 mt-6 border border-cream-200 dark:border-neutral-800 transition-colors duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4 font-poetic text-lg text-inkwell-80 dark:text-dream-dark-text italic">
              Every journey begins with a single whisper.
            </div>
            <label className="block text-inkwell font-medium mb-2 dark:text-dream-dark-text" htmlFor="email">
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
              className="mb-2 bg-cream-50 dark:bg-dream-dark-bg text-inkwell dark:text-dream-dark-text border border-cream-200 dark:border-neutral-800 focus:ring-dream-blue"
              autoComplete="email"
              ref={emailInputRef}
            />
            {errorLine && (
              <div className="text-red-600 text-sm mb-2 italic">{errorLine}</div>
            )}
            {sent ? (
              <div className="text-green-700 text-center font-medium animate-fade-in italic">
                {successLine}
                <br />
                <span className="text-green-800 text-sm">Check your email to continue.</span>
              </div>
            ) : (
              <Button
                type="submit"
                className="w-full bg-dream-blue hover:bg-dream-purple text-white font-semibold py-2 px-4 rounded-xl shadow-soft transition focus:outline-none focus:ring-2 focus:ring-dream-purple focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
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