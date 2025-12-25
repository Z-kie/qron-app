'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { QRONMode } from '@/lib/types'; // Assuming QRONMode is defined here or similar

type DemoQRON = {
  id: string;
  user_id: string; // Will be the DEMO_USER_ID from the seed script
  mode: QRONMode;
  qr_content: string;
  ai_prompt: string;
  storage_path: string; // e.g., /demo-qrons/image.png
  is_demo: boolean;
  scan_count: number;
  created_at: string;
};

export function FeaturedQRONs() {
  const [demoQrons, setDemoQrons] = useState<DemoQRON[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDemoQrons = async () => {
      try {
        const { data, error } = await supabase
          .from('qrons')
          .select('*')
          .eq('is_demo', true)
          .limit(6); // Fetch a limited number for display

        if (error) {
          console.error('Error fetching demo QRONs:', error);
          // Handle error appropriately, e.g., show a message to the user
        } else {
          setDemoQrons(data as DemoQRON[]);
        }
      } catch (err) {
        console.error('Unexpected error fetching demo QRONs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoQrons();
  }, [supabase]);

  if (loading) {
    return (
      <section className="text-center py-8">
        <h2 className="text-3xl font-bold mb-6">Featured Artworks</h2>
        <p className="text-slate-400">Loading stunning QRONs...</p>
      </section>
    );
  }

  if (demoQrons.length === 0) {
    return null; // Don't render section if no demo QRONs found
  }

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-qron-gradient">
        Featured QRON Artworks
      </h2>
      <p className="text-xl text-slate-200 text-center max-w-2xl mx-auto mb-10">
        Experience the limitless creativity of AI Living QR Art.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {demoQrons.map((qron) => (
          <div key={qron.id} className="qron-card relative group overflow-hidden">
            <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              {/* Ensure storage_path points to the public folder */}
              <Image
                src={qron.storage_path}
                alt={qron.ai_prompt || 'QRON Artwork'}
                fill
                style={{ objectFit: 'contain' }} // or 'cover' depending on desired display
                className="transition-transform duration-300 group-hover:scale-105"
                unoptimized // Since these are static assets, optimize manually or use Next.js Image optimization configuration
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium">{qron.ai_prompt}</p>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="bg-qron-primary/20 text-qron-primary px-2 py-0.5 rounded-full text-xs font-semibold mr-2">
                {qron.mode}
              </span>
              <span className="text-slate-400 text-xs">Demo Artwork</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a href="/gallery" className="text-qron-primary hover:underline text-lg font-medium">
          View Full Gallery &rarr;
        </a>
      </div>
    </section>
  );
}
