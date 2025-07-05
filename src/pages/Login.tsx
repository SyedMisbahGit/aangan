import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const { signInWithMagicLink, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [successLine, setSuccessLine] = useState('');
  const [errorLine, setErrorLine] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-focus email input
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    // Magic-link callback handling
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const errorCode = params.get('error_code') || params.get('error_description');
    if (errorCode && (errorCode.toLowerCase().includes('expire') || errorCode.toLowerCase().includes('invalid'))) {
      setMagicLinkError('Naya link mang lo, dost.');
    } else if (type === 'magiclink' && user) {
      // If already signed in, redirect
      navigate('/', { replace: true });
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

  const handleGuestLogin = () => {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
    navigate("/", { replace: true });
  };

  return (
    <DreamLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 transition-colors duration-500">
        <DreamHeader
          title="Welcome to Aangan"
          subtitle="A poetic, anonymous campus sanctuary"
          className="mb-2"
        />
        <div className="w-full max-w-md bg-paper-light rounded-2xl shadow-soft p-8 mt-6 border border-cream-200 transition-colors duration-500">
          {magicLinkError ? (
            <div className="text-center text-2xl text-dream-accent font-poetic py-12">
              {magicLinkError}
              <br />
              <Button className="mt-6" onClick={() => { setMagicLinkError(null); window.history.replaceState({}, document.title, '/login'); }}>
                Request New Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-4 font-poetic text-lg text-inkwell-80 italic">
                Every journey begins with a single whisper.
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
                                  className="mb-2 bg-cream-50 text-inkwell border border-cream-200 focus:ring-dream-blue"
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
          )}
          <button
            onClick={handleGuestLogin}
            className="w-full bg-dream-blue hover:bg-dream-purple text-white font-semibold py-2 px-4 rounded-xl shadow-soft transition focus:outline-none focus:ring-2 focus:ring-dream-purple focus:ring-offset-2 mt-4"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </DreamLayout>
  );
};

export default Login; 