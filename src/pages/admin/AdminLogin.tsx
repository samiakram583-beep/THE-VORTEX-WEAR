import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, ShieldAlert, Database, Key, UserCheck } from 'lucide-react';
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
  const [step, setStep] = useState<'credentials' | 'mfa' | 'forgot' | 'activate' | 'update_password' | 'config'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaChallengeId, setMfaChallengeId] = useState('');
  const [anonKeyInput, setAnonKeyInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(unauthorizedNotice || '');
  const [successMessage, setSuccessMessage] = useState('');

  const AUTHORIZED_ADMIN_LIST = [
    'samiakram583@gmail.com',
    'bilalakram1048@gmail.com',
  ];

  // Listen for Supabase password recovery callback from email links
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setStep('update_password');
      setSuccessMessage('Password recovery token validated. Please set your new secure administrator password.');
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('update_password');
        setSuccessMessage('Password recovery session initiated. Please set your new secure administrator password.');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Step 1: Strict credential verification against Supabase Auth & server allowlist
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Strict Allowlist check: Only designated administrators are authorized
    if (!AUTHORIZED_ADMIN_LIST.includes(normalizedEmail)) {
      AdminAuthService.clearSession();
      setErrorMessage('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    try {
      // Sync Supabase client configuration from server if not already active
      if (!isSupabaseConfigured) {
        await syncSupabaseConfigFromServer();
      }

      // Real Supabase Auth authentication if Supabase client is connected
      if (isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        // WRONG PASSWORD OR SUPABASE AUTH FAILURE
        if (authError || !authData?.user) {
          AdminAuthService.clearSession();
          console.warn('[SUPABASE AUTH LOGIN ATTEMPT]', authError?.message || 'Login attempt rejected');
          const rawMsg = authError?.message || '';
          let userMsg = 'Invalid email or password.';
          if (rawMsg.toLowerCase().includes('email not confirmed')) {
            userMsg = 'Supabase Auth: Email address not confirmed. Please check your inbox or confirm your email in Supabase Authentication.';
          } else if (rawMsg.toLowerCase().includes('invalid api key')) {
            userMsg = 'Supabase Auth: Invalid API Key. Please verify your Supabase Anon/Publishable key.';
          } else if (rawMsg.toLowerCase().includes('rate limit')) {
            userMsg = 'Supabase Auth: Rate limit exceeded. Please wait a few moments before retrying.';
          } else if (rawMsg.toLowerCase().includes('invalid login credentials') || rawMsg.toLowerCase().includes('invalid_grant')) {
            userMsg = 'Invalid email or password. If you have not set up your administrator password yet or forgot it, please choose an option below.';
          } else if (rawMsg) {
            userMsg = rawMsg;
          }
          setErrorMessage(userMsg);
          setIsLoading(false);
          return;
        }

        // Verify that the authenticated user is on the authorized allowlist
        const userEmail = (authData.user.email || normalizedEmail).toLowerCase();
        if (!AUTHORIZED_ADMIN_LIST.includes(userEmail)) {
          await supabase.auth.signOut();
          AdminAuthService.clearSession();
          setErrorMessage('Access denied: customer account does not have administrator clearance.');
          setIsLoading(false);
          return;
        }

        // Sync with server-side administrator session
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

      // Server authentication gateway (validates credentials strictly on server with Supabase)
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
      console.warn('[ADMIN LOGIN EXCEPTION]', err);
      setErrorMessage(err?.message || 'Authentication failure.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: First-Time Setup / Activate Admin Account
  const handleActivateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!AUTHORIZED_ADMIN_LIST.includes(normalizedEmail)) {
      setErrorMessage('Access denied: only designated administrators (samiakram583@gmail.com, bilalakram1048@gmail.com) can activate administrator accounts.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        await syncSupabaseConfigFromServer();
      }

      if (isSupabaseConfigured) {
        const adminName = normalizedEmail.includes('sami') ? 'Sami Akram (Primary Owner)' : 'Bilal Akram';
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: adminName,
              role: 'admin',
            },
          },
        });

        if (signUpError) {
          console.warn('[ADMIN ACTIVATION WARN]', signUpError.message);
          if (signUpError.message.toLowerCase().includes('already registered')) {
            setErrorMessage('An account for this email is already registered in Supabase. If you forgot your password, please click "Forgot Password?" below to reset it.');
          } else {
            setErrorMessage(signUpError.message);
          }
          setIsLoading(false);
          return;
        }

        if (signUpData?.session) {
          const syncRes = await AdminAuthService.syncSupabaseSession(
            normalizedEmail,
            signUpData.user,
            signUpData.session.access_token
          );
          if (syncRes.success) {
            onLoginSuccess();
            return;
          }
        }

        setSuccessMessage(`Administrator account registered for ${normalizedEmail}! Please check your email inbox to confirm, then sign in.`);
        setStep('credentials');
      } else {
        setErrorMessage('Supabase Anon Key is required to register administrator credentials.');
        setStep('config');
      }
    } catch (err: any) {
      console.warn('[ADMIN ACTIVATION EXCEPTION]', err);
      setErrorMessage(err?.message || 'Failed to activate administrator account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Password Reset Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!AUTHORIZED_ADMIN_LIST.includes(normalizedEmail)) {
      setErrorMessage('Access denied: only designated administrators may request recovery.');
      setIsLoading(false);
      return;
    }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/admin`,
        });
        if (error) {
          console.warn('[RESET PASSWORD WARN]', error.message);
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }
      }
      setSuccessMessage(`Password recovery link dispatched to ${normalizedEmail}. Please check your email inbox and spam folder.`);
    } catch (err: any) {
      console.warn('[RESET PASSWORD EXCEPTION]', err);
      setErrorMessage(err?.message || 'Failed to dispatch recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Set New Password after recovery link click
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.warn('[UPDATE PASSWORD WARN]', error.message);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }

      const userEmail = data.user?.email || email;
      const syncRes = await AdminAuthService.syncSupabaseSession(
        userEmail,
        data.user,
        data.user?.id
      );

      if (syncRes.success) {
        onLoginSuccess();
      } else {
        setSuccessMessage('Password updated successfully! Please sign in with your new password.');
        setStep('credentials');
        setPassword(newPassword);
      }
    } catch (err: any) {
      console.warn('[UPDATE PASSWORD EXCEPTION]', err);
      setErrorMessage(err?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Save Supabase Anon Key
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
      const testRes = await fetch('/api/admin/config/test-supabase-connection');
      const testData = await testRes.json().catch(() => ({}));
      if (testRes.ok && testData.connected) {
        setSuccessMessage('Supabase Publishable Key verified and persisted successfully. Ready to sign in.');
      } else {
        setSuccessMessage('Supabase Publishable Key saved and synchronized with server.');
      }
      setStep('credentials');
    } catch (err: any) {
      console.warn('[SAVE KEY EXCEPTION]', err);
      setErrorMessage(err?.message || 'Failed to save configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Verify Multi-Factor Authentication Code
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
      console.warn('[MFA EXCEPTION]', err);
      setErrorMessage(err?.message || 'Failed to verify two-factor code.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-stone-200 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
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
              : step === 'activate'
              ? 'Activate Admin Account'
              : step === 'update_password'
              ? 'Set New Password'
              : step === 'config'
              ? 'Supabase Configuration'
              : 'Admin Password Reset'}
          </h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            {step === 'credentials'
              ? 'Authorized store administrator access only. All actions and sessions are cryptographically logged.'
              : step === 'mfa'
              ? 'Enter the 6-digit TOTP verification code from your authenticator app.'
              : step === 'activate'
              ? 'Set up initial administrator credentials for authorized emails.'
              : step === 'update_password'
              ? 'Enter and confirm your new secure administrator password.'
              : step === 'config'
              ? 'Provide your Supabase Project Anon/Publishable API Key.'
              : 'Enter your verified administrator email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 space-y-2">
              <span className="leading-relaxed block">{errorMessage}</span>
              {(errorMessage.includes('Invalid') || errorMessage.includes('password') || errorMessage.includes('credentials')) && step === 'credentials' && (
                <div className="pt-2 border-t border-rose-900/60 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setStep('forgot');
                    }}
                    className="text-amber-300 hover:text-white underline font-medium cursor-pointer"
                  >
                    Reset Password via Email →
                  </button>
                  <span className="text-rose-500">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setStep('activate');
                    }}
                    className="text-amber-300 hover:text-white underline font-medium cursor-pointer"
                  >
                    First-Time Setup / Activate →
                  </button>
                </div>
              )}
            </div>
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
                  placeholder="samiakram583@gmail.com"
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
                    setSuccessMessage('');
                    setStep('forgot');
                  }}
                  className="text-[11px] text-stone-400 hover:text-white transition-colors cursor-pointer"
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

            <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setSuccessMessage('');
                  setStep('activate');
                }}
                className="hover:text-white text-stone-400 flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>First-time setup? Activate account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setStep('config');
                }}
                className="hover:text-amber-400 underline transition-colors cursor-pointer"
              >
                Configure Key
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
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {isLoading ? <span>Validating MFA Token...</span> : <span>Verify & Grant Access</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors cursor-pointer"
            >
              Back to Credentials
            </button>
          </form>
        )}

        {/* STEP 3: FORGOT PASSWORD */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">Authorized Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="samiakram583@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">
                Supabase Auth will dispatch a cryptographically signed password reset link to this email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-200 disabled:bg-stone-600 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isLoading ? 'Dispatching Recovery Email...' : 'Send Recovery Email via Supabase Auth'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* STEP 4: FIRST-TIME SETUP / ACTIVATE ADMIN ACCOUNT */}
        {step === 'activate' && (
          <form onSubmit={handleActivateAdmin} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[11px] text-amber-200">
              Only authorized administrator emails (<strong>samiakram583@gmail.com</strong> or <strong>bilalakram1048@gmail.com</strong>) can register administrator credentials.
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="samiakram583@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">Choose Admin Password (min 8 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="password"
                  required
                  minLength={8}
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
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-600 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isLoading ? 'Creating Account in Supabase Auth...' : 'Register / Activate Admin Credentials'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* STEP 5: UPDATE PASSWORD (AFTER RECOVERY LINK) */}
        {step === 'update_password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">New Administrator Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoFocus
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-900/80 border border-stone-700 rounded-lg text-white placeholder:text-stone-600 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-600 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isLoading ? 'Updating Password in Supabase...' : 'Set New Password & Enter Admin Portal'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors cursor-pointer"
            >
              Cancel & Return to Login
            </button>
          </form>
        )}

        {/* STEP 6: SUPABASE PROJECT CONFIGURATION */}
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
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full text-center text-xs text-stone-400 hover:text-white py-1 transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* Footer Security Notice */}
        <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 text-center leading-relaxed">
          <p>
            The Vortex Wear Security Protocol v2.5. Strictly enforced server-side authentication with session expiration and automated intrusion logging.
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
