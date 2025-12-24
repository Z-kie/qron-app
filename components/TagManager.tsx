'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Plus, Tag as TagIcon, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';

interface Tag {
  id: string;
  user_id: string;
  name: string;
}

interface TagManagerProps {
  userId: string;
  onTagSelected?: (tagId: string) => void;
}

export function TagManager({ userId, onTagSelected }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        toast.error('Failed to fetch tags: ' + error.message);
        console.error('Error fetching tags:', error);
      } else {
        setTags(data as Tag[]);
      }
      setLoading(false);
    };
    fetchTags();
  }, [userId, supabase]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name cannot be empty.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('tags')
      .insert({ user_id: userId, name: newTagName.trim() });
    if (error) {
      toast.error('Failed to add tag: ' + error.message);
      console.error('Error adding tag:', error);
    } else {
      toast.success('Tag added successfully!');
      setNewTagName('');
      fetchTags();
    }
    setLoading(false);
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editingTagName.trim()) {
      toast.error('Tag name cannot be empty.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('tags')
      .update({ name: editingTagName.trim() })
      .eq('id', tagId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update tag: ' + error.message);
      console.error('Error updating tag:', error);
    } else {
      toast.success('Tag updated successfully!');
      setEditingTagId(null);
      setEditingTagName('');
      fetchTags();
    }
    setLoading(false);
  };

  const handleDeleteTag = async (tagId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to delete tag: ' + error.message);
      console.error('Error deleting tag:', error);
    } else {
      toast.success('Tag deleted successfully!');
      fetchTags();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-qron-primary" />
        <span className="ml-2 text-slate-400">Loading tags...</span>
      </div>
    );
  }

  return (
    <div className="qron-card space-y-4">
      <h3 className="text-xl font-semibold">Tags</h3>

      {/* Add Tag Form */}
      <div className="flex gap-2">
        <input
          type="text"
          className="qron-input flex-grow"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name"
        />
        <button onClick={handleAddTag} className="qron-button p-2">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tags List */}
      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-sm text-slate-400">No tags yet.</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
              {editingTagId === tag.id ? (
                <input
                  type="text"
                  className="qron-input flex-grow text-sm"
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                />
              ) : (
                <button
                  onClick={() => onTagSelected && onTagSelected(tag.id)}
                  className="flex items-center gap-2 flex-grow text-left text-slate-200 hover:text-white"
                >
                  <TagIcon className="w-5 h-5" />
                  <span>{tag.name}</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                {editingTagId === tag.id ? (
                  <>
                    <button onClick={() => handleUpdateTag(tag.id)} className="text-green-500 hover:text-green-400">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingTagId(null); setEditingTagName(''); }} className="text-red-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditingTagId(tag.id); setEditingTagName(tag.name); }}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleDeleteTag(tag.id)} className="text-red-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
