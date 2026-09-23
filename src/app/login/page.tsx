'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Heart, Lock, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error || 'Invalid email or password.');
      return;
    }
    toast.success('Signed in successfully.');
    window.location.href = result.redirectUrl || '/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gradient-to-b from-brand-50/20 via-background to-background dark:from-brand-950/10">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-2xl shadow-brand-900/5">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-500 text-white shadow-xl">
              <Heart className="h-7 w-7 fill-white" />
            </div>
            <h1 className="text-3xl font-bold font-serif">Member Sign In</h1>
            <p className="mt-2 text-xs text-muted-foreground">Use the password created for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-semibold">
              Email address
              <span className="relative mt-1.5 block">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-3.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </span>
            </label>

            <label className="block text-xs font-semibold">
              <span className="flex items-center justify-between">
                Password
                <Link href="/forgot-password" className="text-[11px] text-brand-600 hover:underline">Forgot password?</Link>
              </span>
              <span className="relative mt-1.5 block">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-10 text-xs focus:border-brand-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-xs font-bold text-white disabled:opacity-50">
              <ArrowRight className="h-4 w-4" /> {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            Need an account? <Link href="/register" className="font-bold text-brand-600 hover:underline">Register</Link>
          </p>
          <div className="mt-5 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure HTTP-only session
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
