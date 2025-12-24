'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

import { User } from '@supabase/supabase-js';
import { QRONMode, QRONEntry } from '@/lib/types';

interface QRONGalleryProps {
  currentUserId?: string; // New prop for filtering by user ID
  selectedFolderId?: string | null;
  selectedTagId?: string | null;
}

export function QRONGallery({ currentUserId, selectedFolderId, selectedTagId }: QRONGalleryProps) {
  const [qrons, setQrons] = useState<QRONEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null); // Keep user state if currentUserId is not always provided

  // This useEffect now primarily handles setting the user for non-dashboard views
  useEffect(() => {
    if (!currentUserId) {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
      getUser();
    } else {
      setUser({ id: currentUserId } as User); // Set a dummy user object for type compatibility
    }
  }, [supabase, currentUserId]);

  useEffect(() => {
    const fetchQRONs = async () => {
      setLoading(true);
      try {
        let query = supabase.from('qrons').select('*, qron_tags(tag_id)'); // Select qron_tags to filter by tags

        // Prioritize currentUserId (from dashboard)
        if (currentUserId) {
          query = query.eq('user_id', currentUserId).eq('is_demo', false);
        } else if (user) {
          // Fallback for main gallery if user is logged in
          query = supabase.from('qrons').select('*, qron_tags(tag_id)').or(`user_id.eq.${user.id},is_demo.eq.true`);
        } else {
          // Default to demo QRONs if no user and not dashboard
          query = query.eq('is_demo', true);
        }

        // Apply folder filter
        if (selectedFolderId) {
          query = query.eq('folder_id', selectedFolderId);
        }

        // Apply tag filter (more complex, requires join)
        if (selectedTagId) {
            // This requires a join and filter on the join table.
            // Supabase's PostgREST has limitations on how deeply you can filter
            // related tables directly in the .eq() method.
            // A common workaround is to use a stored procedure or perform two queries.
            // For now, let's keep it simple: we'll filter client-side or assume
            // the tags are part of the QRON object (which they are via rpc in next step)
            // Or we do a RPC call here.
            // I'll leave the actual tag filtering for a later step, as it's more involved.
        }
        
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching QRONs:', error);
        } else {
          // Filter by tag client-side if selectedTagId is present
          let filteredQrons = (data as QRONEntry[]);
          if (selectedTagId) {
            filteredQrons = filteredQrons.filter(qron => 
                qron.qron_tags && qron.qron_tags.some(qt => qt.tag_id === selectedTagId)
            );
          }
          setQrons(filteredQrons);
        }
      } catch (err) {
        console.error('Unexpected error fetching QRONs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user || currentUserId) { // Only fetch if user context is available
      fetchQRONs();
    } else {
      setLoading(false); // If no user and not currentUserId context, don't load forever
    }
  }, [supabase, user, currentUserId, selectedFolderId, selectedTagId]);

  if (loading) {
    return <p className="text-center text-slate-300">Loading QRON Gallery...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Filter options now managed externally by FolderManager and TagManager */}

      {qrons.length === 0 ? (
        <p className="text-center text-slate-300 text-lg">
          No QRONs found for this selection.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {qrons.map((qron) => (
            <Link href={`/dashboard/${qron.id}`} key={qron.id} className="qron-card relative group overflow-hidden cursor-pointer">
              <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src={qron.storage_path}
                  alt={qron.ai_prompt || 'QRON Artwork'}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{qron.ai_prompt}</p>
                </div>
              </div>
              <div className="mt-3 text-sm flex justify-between items-center">
                <div>
                    <span className="bg-qron-primary/20 text-qron-primary px-2 py-0.5 rounded-full text-xs font-semibold mr-2">
                        {qron.mode}
                    </span>
                    {qron.is_demo && (
                        <span className="bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                            Demo
                        </span>
                    )}
                </div>
                {qron.scan_count > 0 && (
                    <span className="text-slate-400 text-xs">Scans: {qron.scan_count}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

