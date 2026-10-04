import React, { useState } from 'react';
import { X, Shield, User, Lock, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../lib/store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToOrders?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAdmin,
  onNavigateToOrders,
}) => {
  const { currentUser, login, register, logout, resetPassword } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        if (!email || !password) {
          setErrorMessage('Please fill in both email and password.');
          return;
        }
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message || 'Invalid email or password.');
        }
      } else if (mode === 'register') {
        if (!fullName || !email || !password) {
          setErrorMessage('Please fill in name, email, and password.');
          return;
        }
        const res = await register(fullName, email, password, phone);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMessage('Please enter your account email.');
          return;
        }
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(res.message || `Password recovery instructions have been sent to ${email}`);
        } else {
          setErrorMessage(res.message || 'Failed to send reset email.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">The Vortex Wear</span>
            <h3 className="text-xl font-bold text-stone-950 font-display">
              {currentUser ? 'My Account' : mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is already logged in, show profile overview and quick navigation */}
        {currentUser ? (
          <div className="space-y-6">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#121212] text-white flex items-center justify-center font-bold text-sm font-display">
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{currentUser.full_name}</h4>
                    <p className="text-xs text-stone-500">{currentUser.email}</p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                    currentUser.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              {currentUser.role === 'admin' && onNavigateToAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToAdmin();
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Open Admin Dashboard
                </button>
              )}

              {onNavigateToOrders && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToOrders();
                  }}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  View My Orders
                </button>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Sign Out of The Vortex Wear
            </button>
          </div>
        ) : (
          <div>
            {/* Feedback messages */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Farooq"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number (for Pakistan COD delivery)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-stone-500 hover:text-stone-900"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#121212] hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isSubmitting
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Send Recovery Link'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div className="mt-5 text-center text-xs text-stone-600">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                    className="font-bold text-stone-900 hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    className="font-bold text-stone-900 hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>

            {/* Link to Admin Portal */}
            <div className="mt-4 pt-3 border-t border-stone-100 text-center">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToAdmin) onNavigateToAdmin();
                }}
                className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center justify-center gap-1 mx-auto"
              >
                <Shield className="w-3 h-3" />
                <span>Authorized Administrator Access</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
