'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ImageGenerator from '@/components/image-generator';
import { NavLayout } from '@/components/nav-layout';
import { Info } from 'lucide-react';

/**
 * Studio Mode - Image Generation Page
 * Transforms chat discussions into visual artwork
 */
export default function StudioPage() {
  const searchParams = useSearchParams();
  const [critiqueContext, setCritiqueContext] = useState<string | null>(null);

  useEffect(() => {
    // Check if we came from critique page
    if (searchParams.get('fromCritique') === 'true') {
      const context = sessionStorage.getItem('critiqueContext');
      if (context) {
        setCritiqueContext(context);
      }
    }
  }, [searchParams]);

  return (
    <NavLayout>
      <div className="flex flex-col h-full bg-[#22223B]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Studio Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#C9ADA7] to-[#9A8C98] bg-clip-text text-transparent mb-2">
                Studio Mode
              </h2>
              <p className="text-[#9A8C98]">
                Generate and edit artwork with AI. Describe your vision or upload images to transform.
              </p>

              {/* Context from Critique */}
              {critiqueContext && (
                <div className="mt-4 p-4 rounded-lg bg-[#2a2a45] border border-[#4A4E69]">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-[#C9ADA7] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#F2E9E4] mb-1">
                        Context from Critique Chat
                      </div>
                      <div className="text-xs text-[#9A8C98] whitespace-pre-wrap line-clamp-3">
                        {critiqueContext}
                      </div>
                      <button
                        onClick={() => setCritiqueContext(null)}
                        className="text-xs text-[#C9ADA7] hover:text-[#F2E9E4] mt-2 underline"
                      >
                        Clear context
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Generator Interface */}
            <div className="relative">
              <ImageGenerator contextPrompt={critiqueContext} />
            </div>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
