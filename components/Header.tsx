'use client';

import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profile) {
          setUserTier(profile.tier);
        }
      } else {
        setUserTier(null);
      }
    };
    getUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Refetch profile on auth state change
        supabase.from('profiles').select('tier').eq('id', session.user.id).single()
          .then(({ data: profile, error }) => {
            if (error) console.error('Error fetching profile on auth change:', error);
            else if (profile) setUserTier(profile.tier);
          });
      } else {
        setUserTier(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-qron-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="text-xl font-bold text-white">QRON</span>
          <span className="text-xs bg-qron-primary/20 text-qron-primary px-2 py-0.5 rounded-full">
            BETA
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/gallery" className="text-slate-400 hover:text-white transition-colors text-sm">
            Gallery
          </Link>
          <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors text-sm">
            Pricing
          </Link>
          <Link href="/docs" className="text-slate-400 hover:text-white transition-colors text-sm">
            Docs
          </Link>
          {user && ( // Only show dashboard link if user is logged in
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Social & Auth */}
        <div className="flex items-center gap-3">
          <a
            href="https://twitter.com/QRONofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/QRON-2026/qron-starter-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{user.email}</span>
              {userTier && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                  ${userTier === 'free' ? 'bg-qron-primary/20 text-qron-primary' :
                    userTier === 'pro' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-purple-500/20 text-purple-400'}`
                }>
                  {userTier}
                </span>
              )}
              <button onClick={handleLogout} className="qron-button-secondary text-sm">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="qron-button-secondary text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
