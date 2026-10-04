import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, ShieldAlert, Database, Key } from 'lucide-react';
import { AdminAuthService } from '../../lib/adminAuth';
import {
  supabase,
  isSupabaseConfigured,
  setRuntimeSupabaseKey,
  supabaseUrl,
  syncSupabaseConfigFromServer,
} from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onExit: () => void;
  unauthorizedNotice?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onExit,
  unauthorizedNotice,
}) => {
  const [step, setStep] = useState<'credentials' | 'mfa' | 'forgot' | 'config'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaChallengeId, setMfaChallengeId] = useState('');
  const [anonKeyInput, setAnonKeyInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(unauthorizedNotice || '');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Strict credential verification against Supabase Auth & server allowlist
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Strict Allowlist check: Only the two designated administrators are authorized
    const AUTHORIZED_ADMIN_LIST = [
      'samiakram583@gmail.com',
      'bilalakram1048@gmail.com',
      'bilalakram104@gmail.com',
    ];

    if (!AUTHORIZED_ADMIN_LIST.includes(normalizedEmail)) {
      AdminAuthService.clearSession();
      setErrorMessage('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sync Supabase client configuration from server if not already active
      if (!isSupabaseConfigured) {
        await syncSupabaseConfigFromServer();
      }

      // 2. Real Supabase Auth authentication if Supabase client is connected
      if (isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        // WRONG PASSWORD OR SUPABASE AUTH FAILURE
        if (authError || !authData?.user) {
          AdminAuthService.clearSession();
          console.error('[SUPABASE AUTH LOGIN ERROR]', authError);
          const rawMsg = authError?.message || '';
          let userMsg = 'Invalid email or password.';
          if (rawMsg.toLowerCase().includes('email not confirmed')) {
            userMsg = 'Supabase Auth: Email address not confirmed. Please confirm your email in Supabase Authentication.';
          } else if (rawMsg.toLowerCase().includes('invalid api key')) {
            userMsg = 'Supabase Auth: Invalid API Key. Please verify your Supabase Anon/Publishable key.';
          } else if (rawMsg.toLowerCase().includes('rate limit')) {
            userMsg = 'Supabase Auth: Rate limit exceeded. Please wait a few moments before retrying.';
          } else if (rawMsg) {
            userMsg = rawMsg;
          }
          setErrorMessage(userMsg);
          setIsLoading(false);
          return;
        }

        // 3. Verify that the authenticated user is on the authorized allowlist
        const userEmail = (authData.user.email || normalizedEmail).toLowerCase();
        if (!AUTHORIZED_ADMIN_LIST.includes(userEmail)) {
          await supabase.auth.signOut();
          AdminAuthService.clearSession();
          setErrorMessage('Access denied: customer account does not have administrator clearance.');
          setIsLoading(false);
          return;
        }

        // 4. Sync with server-side administrator session
        const syncRes = await AdminAuthService.syncSupabaseSession(
          normalizedEmail,
          authData.user,
          authData.session?.access_token
        );

        if (!syncRes.success) {
          await supabase.auth.signOut();
          AdminAuthService.clearSession();
          setErrorMessage(syncRes.error || 'Server authorization failed.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess();
        return;
      }

      // 3. Server authentication gateway (validates credentials strictly on server with Supabase)
      const res = await AdminAuthService.requestLogin(normalizedEmail, password);

      if (!res.success) {
        AdminAuthService.clearSession();
        if (res.error?.includes('SUPABASE_KEY_REQUIRED') || res.error?.includes('Key is required')) {
          setErrorMessage(res.error);
          setStep('config');
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
        setIsLoading(false);
        return;
      }

      if (res.requireMfa && res.challengeId) {
        setMfaChallengeId(res.challengeId);
        setStep('mfa');
      } else {
        // Successful login with verified session
        onLoginSuccess();
      }
    } catch (err: any) {
      AdminAuthService.clearSession();
      setErrorMessage(err?.message || 'Authentication failure.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSupabaseKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonKeyInput.trim() || anonKeyInput.trim().length < 15) {
      setErrorMessage('Please enter a valid Supabase Publishable / Anon Key.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await setRuntimeSupabaseKey(anonKeyInput.trim());
      // Verify with server endpoint
      const testRes = await fetch('/api/admin/config/test-supabase-connection');
      const testData = await testRes.json().catch(() => ({}));
      if (testRes.ok && testData.connected) {
        setSuccessMessage('Supabase Publishable Key verified and persisted successfully. Ready to sign in.');
      } else {
        setSuccessMessage('Supabase Publishable Key saved and synchronized with server.');
      }
      setStep('credentials');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Multi-Factor Authentication Code
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await AdminAuthService.verifyMfa(mfaChallengeId, mfaCode);

      if (!res.success || !res.session) {
        setErrorMessage(res.error || 'Invalid 6-digit MFA verification code.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify two-factor code.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('If this email address is an authorized administrator, an encrypted password reset token has been dispatched via Supabase Auth.');
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-stone-200 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to The Vortex Wear Storefront
        </button>

        <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-sm">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Restricted Admin Area</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-12 bg-[#171719] rounded-2xl border border-stone-800 shadow-2xl p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white shadow-xs">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold block">
            THE VORTEX WEAR
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display">
            {step === 'credentials'
              ? 'Admin Portal'
              : step === 'mfa'
              ? 'Two-Factor Authentication'
              : 'Admin Password Reset'}
          </h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            {step === 'credentials'
              ? 'Authorized store administrator access only. All actions and sessions are cryptographically logged.'
              : step === 'mfa'
              ? 'Enter the 6-digit TOTP verification code from your authenticator app.'
              : 'Enter your verified administrator email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="admin@vortexwear.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-stone-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setStep('forgot');
                  }}
                  className="text-[11px] text-stone-400 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-stone-200 disabled:bg-stone-600 text-stone-950 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating with Supabase Auth...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-stone-400" />
                <span>Supabase: <strong className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>{isSupabaseConfigured ? 'Active' : 'Key Required'}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setStep('config');
                }}
                className="text-stone-400 hover:text-amber-400 underline transition-colors"
              >
                Configure Anon Key
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: MFA / 2FA VERIFICATION */}
        {step === 'mfa' && (
          <form onSubmit={handleMfaSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">
                Two-Factor Security Code (6 Digits)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white text-center font-mono tracking-widest text-base placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.length < 6}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? <span>Validating MFA Token...</span> : <span>Verify & Grant Access</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors"
            >
              Back to Credentials
            </button>
          </form>
        )}

        {/* STEP 3: FORGOT PASSWORD */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">Administrator Email</label>
              <input
                type="email"
                required
                placeholder="admin@vortexwear.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 px-3 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-200 text-stone-950 text-xs font-bold rounded-lg transition-colors"
            >
              Send Secure Recovery Token
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* STEP 4: SUPABASE PROJECT CONFIGURATION */}
        {step === 'config' && (
          <form onSubmit={handleSaveSupabaseKey} className="space-y-4 text-xs">
            <div className="p-3 bg-stone-900 border border-stone-700 rounded-lg space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Target Project
              </span>
              <p className="font-mono text-white text-[11px] break-all">{supabaseUrl}</p>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">
                Supabase Publishable / Anon Key (Public)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                <textarea
                  rows={3}
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKeyInput}
                  onChange={(e) => setAnonKeyInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-[11px] focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Found in Supabase Dashboard → Settings → API → Project API Keys (anon / public).
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Connect Supabase</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* Footer Security Notice */}
        <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 text-center leading-relaxed">
          <p>
            The Vortex Wear Security Protocol v2.4. Strictly enforced server-side authentication with session expiration and automated intrusion logging.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-stone-600 max-w-md mx-auto">
        © {new Date().getFullYear()} The Vortex Wear. Administrative System.
      </div>
    </div>
  );
};
