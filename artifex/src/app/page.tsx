import { NavLayout } from '@/components/nav-layout';
import { Palette, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Home page - Introduction to Artifex
 */
export default function Home() {
  return (
    <NavLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12 bg-[#22223B]">
        <div className="max-w-4xl w-full space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A4E69] text-[#C9ADA7] text-sm font-medium border border-[#C9ADA7]/20">
              AI Art Critic & Co-Creator
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold text-[#F2E9E4]">
              Artifex
            </h1>

            <p className="text-xl sm:text-2xl text-[#9A8C98] max-w-2xl mx-auto leading-relaxed">
              An interactive AI art critic and co-creator. Chat about art, get critique,
              and generate new artwork from your discussions.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/critique">
                <Button size="lg" className="gap-2 bg-[#C9ADA7] hover:bg-[#9A8C98] text-[#22223B] font-semibold">
                  <MessageSquare size={20} />
                  Start Critique
                </Button>
              </Link>
              <Link href="/studio">
                <Button size="lg" variant="outline" className="gap-2 border-[#4A4E69] text-[#C9ADA7] hover:bg-[#4A4E69] hover:text-[#F2E9E4]">
                  <Palette size={20} />
                  Open Studio
                </Button>
              </Link>
            </div>
          </div>

          {/* Meet Our Critics Section */}
          <div className="space-y-6 pt-8">
            <h2 className="text-3xl font-bold text-center text-[#F2E9E4]">
              Meet Our Critics
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'The Gallerist',
                  emoji: '🎨',
                  intro: "I am The Gallerist, a sophisticated and cultured art critic with years of experience in the gallery world. I offer refined, encouraging, and precise insights into art, helping artists understand how their work might be received in professional spaces."
                },
                {
                  name: 'The Academic',
                  emoji: '📚',
                  intro: "I am The Academic, an art historian and critic. I focus on art theory, historical context, and critical analysis. My approach is scholarly, referencing art movements, theoretical frameworks, and historical precedents to provide thorough critiques."
                },
                {
                  name: 'The Snob',
                  emoji: '🎭',
                  intro: "Ah, I see you need clarification. I am The Snob, the art critic with an impossibly discerning eye and a penchant for the cutting remark. I'm here to offer my sharp, witty critiques of the art world, where mediocrity is swiftly dispatched and true genius is reluctantly acknowledged."
                },
                {
                  name: 'The Friend',
                  emoji: '💚',
                  intro: "I'm The Friend, your supportive and enthusiastic art buddy! I'm here to chat about art in a warm and encouraging way. I love exploring how art makes us feel and diving into the stories behind it. Let's enjoy some art together!"
                },
                {
                  name: 'The Machine',
                  emoji: '🤖',
                  intro: "I am The Machine, an AI art critic. I analyze art using logic, pattern recognition, and statistical analysis. My focus is on compositional ratios, color theory principles, and visual weight distribution. My observations are based on extensive data comparisons, offering insights into artistic works with precision."
                },
                {
                  name: 'The Collector',
                  emoji: '💎',
                  intro: "I am The Collector, an art enthusiast obsessed with provenance, market value, and investment potential. I view art through the lens of rarity, cultural significance, and what belongs in a private collection. I discuss auction records, comparable sales, and the excitement of discovering treasures."
                },
                {
                  name: 'The Mystic',
                  emoji: '🔮',
                  intro: "I am The Mystic, an art critic who interprets works through spiritual, symbolic, and esoteric meanings. I see deeper metaphysical connections, archetypal patterns, and transcendent messages in every piece. I explore sacred geometry, color symbolism, and universal consciousness through art."
                },
                {
                  name: 'The Street Critic',
                  emoji: '🎤',
                  intro: "I'm The Street Critic - raw, unfiltered opinions from an outsider perspective with no formal training. I speak in casual, authentic voice about what hits different and what resonates culturally. I keep it real about what's fire and what's mid, no pretension."
                },
                {
                  name: 'The Provocateur',
                  emoji: '⚡',
                  intro: "I am The Provocateur, deliberately contrarian and boundary-pushing. I question everything, challenge conventions, and offer radical reinterpretations that make people uncomfortable. I'm not here to make friends - I'm here to expose contradictions and force new perspectives."
                },
              ].map(critic => (
                <div key={critic.name} className="p-6 rounded-lg border border-[#4A4E69] bg-[#2a2a45]/50 backdrop-blur-sm space-y-3 hover:border-[#C9ADA7] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{critic.emoji}</div>
                    <h3 className="text-lg font-bold text-[#F2E9E4]">{critic.name}</h3>
                  </div>
                  <p className="text-sm text-[#9A8C98] leading-relaxed">
                    {critic.intro}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
