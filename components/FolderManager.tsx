'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Plus, Folder as FolderIcon, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';

interface Folder {
  id: string;
  user_id: string;
  name: string;
}

interface FolderManagerProps {
  userId: string;
  onFolderSelected?: (folderId: string | null) => void;
}

export function FolderManager({ userId, onFolderSelected }: FolderManagerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchFolders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        toast.error('Failed to fetch folders: ' + error.message);
        console.error('Error fetching folders:', error);
      } else {
        setFolders(data as Folder[]);
      }
      setLoading(false);
    };
    fetchFolders();
  }, [userId, supabase]);

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('folders')
      .insert({ user_id: userId, name: newFolderName.trim() });
    if (error) {
      toast.error('Failed to add folder: ' + error.message);
      console.error('Error adding folder:', error);
    } else {
      toast.success('Folder added successfully!');
      setNewFolderName('');
      fetchFolders();
    }
    setLoading(false);
  };

  const handleUpdateFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) {
      toast.error('Folder name cannot be empty.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('folders')
      .update({ name: editingFolderName.trim() })
      .eq('id', folderId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update folder: ' + error.message);
      console.error('Error updating folder:', error);
    } else {
      toast.success('Folder updated successfully!');
      setEditingFolderId(null);
      setEditingFolderName('');
      fetchFolders();
    }
    setLoading(false);
  };

  const handleDeleteFolder = async (folderId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to delete folder: ' + error.message);
      console.error('Error deleting folder:', error);
    } else {
      toast.success('Folder deleted successfully!');
      if (onFolderSelected) {
        onFolderSelected(null); // Deselect if the deleted folder was selected
      }
      fetchFolders();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-qron-primary" />
        <span className="ml-2 text-slate-400">Loading folders...</span>
      </div>
    );
  }

  return (
    <div className="qron-card space-y-4">
      <h3 className="text-xl font-semibold">Folders</h3>

      {/* Add Folder Form */}
      <div className="flex gap-2">
        <input
          type="text"
          className="qron-input flex-grow"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
        />
        <button onClick={handleAddFolder} className="qron-button p-2">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Folders List */}
      <div className="space-y-2">
        {folders.length === 0 ? (
          <p className="text-sm text-slate-400">No folders yet.</p>
        ) : (
          folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
              {editingFolderId === folder.id ? (
                <input
                  type="text"
                  className="qron-input flex-grow text-sm"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                />
              ) : (
                <button
                  onClick={() => onFolderSelected && onFolderSelected(folder.id)}
                  className="flex items-center gap-2 flex-grow text-left text-slate-200 hover:text-white"
                >
                  <FolderIcon className="w-5 h-5" />
                  <span>{folder.name}</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                {editingFolderId === folder.id ? (
                  <>
                    <button onClick={() => handleUpdateFolder(folder.id)} className="text-green-500 hover:text-green-400">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingFolderId(null); setEditingFolderName(''); }} className="text-red-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleDeleteFolder(folder.id)} className="text-red-500 hover:text-red-400">
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
