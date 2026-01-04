'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Code2, Trophy, Users, Target, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push('/dashboard');
    }    
  }, [initialized, isAuthenticated]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-[#E5E7EB]">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: Code2,
      title: 'DSA Problems',
      description: 'Master algorithms and data structures with curated problems',
    },
    {
      icon: Target,
      title: 'Practice Coding',
      description: 'Sharpen your skills with programming practice',
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete globally and climb the rankings',
    },
    {
      icon: Users,
      title: 'Communities',
      description: 'Join groups and compete locally',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-[#E5E7EB] mb-6">
            Master{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#38BDF8]">
              Competitive Coding
            </span>
          </h1>
          <p className="text-xl text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
            Practice DSA problems, solve programming challenges, and climb the
            global leaderboard. Your journey to coding excellence starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white text-lg px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B] text-lg px-8"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#E5E7EB] mb-4">
            Why NeetCode?
          </h2>
          <p className="text-[#9CA3AF] text-lg">
            Everything you need to become a better programmer
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#1E293B] border border-[#334155] rounded-lg p-6 hover:border-[#22C55E] transition-colors"
              >
                <div className="bg-[#22C55E]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[#22C55E]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#9CA3AF]">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8 lg:p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#E5E7EB] mb-4">
            Ready to Start Coding?
          </h2>
          <p className="text-[#9CA3AF] text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers improving their coding skills every day
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white text-lg px-8"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#334155] py-8">
        <div className="container mx-auto px-4 text-center text-[#9CA3AF]">
          <p>© 2024 NeetCode. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
