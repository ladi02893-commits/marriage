'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      setIsLoading(false);

      if (result.success) {
        toast.success('Welcome back! Authentication successful.');
        const targetUrl = result.redirectUrl || (email.toLowerCase().includes('ladi') ? '/admin' : '/dashboard');
        window.location.href = targetUrl;
      } else {
        toast.error(result.error || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error('Failed to connect to authentication service.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50/20 via-background to-background dark:from-brand-950/10">
        <div className="w-full max-w-md space-y-8">
          {/* Main Login Card */}
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-2xl shadow-brand-900/5 relative overflow-hidden backdrop-blur-xl">
            {/* Top decorative accent */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />

            <div className="text-center mb-8 relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-500 text-white shadow-xl shadow-brand-600/30 mb-4 ring-4 ring-brand-500/10">
                <Heart className="h-7 w-7 fill-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                Member Sign In
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                Enter your verified credentials to access your matrimonial dashboard & matches.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ladi02893@gmail.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-border bg-muted/30 pl-10 pr-3.5 py-3 text-xs text-foreground focus:border-brand-500 focus:bg-background focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">Password</label>
                  <Link href="/forgot-password" className="text-[11px] font-medium text-brand-600 hover:text-brand-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-border bg-muted/30 pl-10 pr-10 py-3 text-xs text-foreground focus:border-brand-500 focus:bg-background focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-brand-700 py-3.5 text-xs font-bold text-white shadow-xl shadow-brand-600/25 transition hover:from-brand-700 hover:to-rose-700 disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" /> Sign In to Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand-600" /> One-Click Quick Sign In
                </span>
                <span className="text-[10px] text-muted-foreground">Dev & Test Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('ladi02893@gmail.com');
                    setPassword('password123');
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-left hover:border-amber-500 transition"
                >
                  <div className="h-7 w-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate">Super Admin</div>
                    <div className="text-[10px] text-muted-foreground truncate">ladi02893@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('amna.khan@gmail.com');
                    setPassword('password123');
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-left hover:border-rose-500 transition"
                >
                  <div className="h-7 w-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    👩
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-300 truncate">Amna Khan</div>
                    <div className="text-[10px] text-muted-foreground truncate">amna.khan@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('hamza.malik@gmail.com');
                    setPassword('password123');
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 text-left hover:border-blue-500 transition"
                >
                  <div className="h-7 w-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    👨
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-blue-800 dark:text-blue-300 truncate">Dr. Hamza Malik</div>
                    <div className="text-[10px] text-muted-foreground truncate">hamza.malik@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('bilal.ahmed@gmail.com');
                    setPassword('password123');
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-left hover:border-emerald-500 transition"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    👨
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">Engr. Bilal Ahmed</div>
                    <div className="text-[10px] text-muted-foreground truncate">bilal.ahmed@gmail.com</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border/80 text-center text-xs text-muted-foreground">
              Don't have a matrimonial profile yet?{' '}
              <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                Create Account Free
              </Link>
            </div>

            {/* Privacy & Safety Guarantee */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 py-2 px-3 rounded-xl border border-border/50">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Verified Profiles • 256-bit SSL Data Encryption</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
