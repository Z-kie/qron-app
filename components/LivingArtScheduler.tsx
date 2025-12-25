'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Save, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface LivingArtSchedule {
  id: string;
  qron_id: string;
  user_id: string;
  start_time: string; // ISO string
  end_time: string | null; // ISO string
  target_image_url: string;
  transition_type: 'fade' | 'cut' | 'morph' | 'default';
  is_active: boolean;
}

interface LivingArtSchedulerProps {
  qronId: string;
  userId: string;
}

export function LivingArtScheduler({ qronId, userId }: LivingArtSchedulerProps) {
  const [schedules, setSchedules] = useState<LivingArtSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<Partial<LivingArtSchedule>>({
    qron_id: qronId,
    user_id: userId,
    start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_time: null,
    target_image_url: '',
    transition_type: 'default',
    is_active: true,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('living_art_schedules')
        .select('*')
        .eq('qron_id', qronId)
        .order('start_time', { ascending: true });

      if (error) {
        toast.error('Failed to fetch schedules: ' + error.message);
        console.error('Error fetching schedules:', error);
      } else {
        setSchedules(data as LivingArtSchedule[]);
      }
      setLoading(false);
    };
    fetchSchedules();
  }, [qronId, supabase]);

  const handleAddSchedule = async () => {
    if (!newSchedule.target_image_url || !newSchedule.start_time) {
      toast.error('Target Image URL and Start Time are required.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('living_art_schedules')
      .insert({
        ...newSchedule,
        start_time: new Date(newSchedule.start_time!).toISOString(),
        end_time: newSchedule.end_time ? new Date(newSchedule.end_time).toISOString() : null,
      });

    if (error) {
      toast.error('Failed to add schedule: ' + error.message);
      console.error('Error adding schedule:', error);
    } else {
      toast.success('Schedule added successfully!');
      setNewSchedule({
        qron_id: qronId,
        user_id: userId,
        start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end_time: null,
        target_image_url: '',
        transition_type: 'default',
        is_active: true,
      });
      fetchSchedules();
    }
    setLoading(false);
  };

  const handleUpdateSchedule = async (schedule: LivingArtSchedule) => {
    if (!schedule.target_image_url || !schedule.start_time) {
      toast.error('Target Image URL and Start Time are required.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('living_art_schedules')
      .update({
        start_time: new Date(schedule.start_time).toISOString(),
        end_time: schedule.end_time ? new Date(schedule.end_time).toISOString() : null,
        target_image_url: schedule.target_image_url,
        transition_type: schedule.transition_type,
        is_active: schedule.is_active,
      })
      .eq('id', schedule.id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update schedule: ' + error.message);
      console.error('Error updating schedule:', error);
    } else {
      toast.success('Schedule updated successfully!');
      setEditingScheduleId(null);
      fetchSchedules();
    }
    setLoading(false);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('living_art_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to delete schedule: ' + error.message);
      console.error('Error deleting schedule:', error);
    } else {
      toast.success('Schedule deleted successfully!');
      fetchSchedules();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-qron-primary" />
        <span className="ml-2 text-slate-400">Loading schedules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Living Art Schedules</h3>

      {/* Add New Schedule Form */}
      <div className="qron-card p-4 space-y-3">
        <h4 className="text-lg font-medium">Add New Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Start Time</label>
            <input
              type="datetime-local"
              className="qron-input w-full"
              value={newSchedule.start_time}
              onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">End Time (Optional)</label>
            <input
              type="datetime-local"
              className="qron-input w-full"
              value={newSchedule.end_time || ''}
              onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value || null })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Target Image URL</label>
            <input
              type="url"
              className="qron-input w-full"
              value={newSchedule.target_image_url}
              onChange={(e) => setNewSchedule({ ...newSchedule, target_image_url: e.target.value })}
              placeholder="https://your-image.com/new-art.png"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Transition Type</label>
            <select
              className="qron-input w-full"
              value={newSchedule.transition_type}
              onChange={(e) => setNewSchedule({ ...newSchedule, transition_type: e.target.value as LivingArtSchedule['transition_type'] })}
            >
              <option value="default">Default</option>
              <option value="fade">Fade</option>
              <option value="cut">Cut</option>
              {/* <option value="morph">Morph (future)</option> */}
            </select>
          </div>
          <div className="flex items-center md:col-span-2">
            <input
              type="checkbox"
              id="newScheduleActive"
              className="mr-2"
              checked={newSchedule.is_active}
              onChange={(e) => setNewSchedule({ ...newSchedule, is_active: e.target.checked })}
            />
            <label htmlFor="newScheduleActive" className="text-sm text-slate-400">Is Active</label>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleAddSchedule} className="qron-button flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Schedule
          </button>
        </div>
      </div>

      {/* Existing Schedules List */}
      <div className="qron-card p-4 space-y-4">
        <h4 className="text-lg font-medium">Existing Schedules ({schedules.length})</h4>
        {schedules.length === 0 ? (
          <p className="text-sm text-slate-400 text-center">No living art schedules defined yet.</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between">
                {editingScheduleId === schedule.id ? (
                  // Edit mode
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">Start Time</label>
                      <input
                        type="datetime-local"
                        className="qron-input w-full text-sm"
                        value={format(parseISO(schedule.start_time), "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => setSchedules(schedules.map(s => s.id === schedule.id ? { ...s, start_time: e.target.value } : s))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">End Time</label>
                      <input
                        type="datetime-local"
                        className="qron-input w-full text-sm"
                        value={schedule.end_time ? format(parseISO(schedule.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => setSchedules(schedules.map(s => s.id === schedule.id ? { ...s, end_time: e.target.value || null } : s))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-500 mb-0.5">Target Image URL</label>
                      <input
                        type="url"
                        className="qron-input w-full text-sm"
                        value={schedule.target_image_url}
                        onChange={(e) => setSchedules(schedules.map(s => s.id === schedule.id ? { ...s, target_image_url: e.target.value } : s))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">Transition</label>
                      <select
                        className="qron-input w-full text-sm"
                        value={schedule.transition_type}
                        onChange={(e) => setSchedules(schedules.map(s => s.id === schedule.id ? { ...s, transition_type: e.target.value as LivingArtSchedule['transition_type'] } : s))}
                      >
                        <option value="default">Default</option>
                        <option value="fade">Fade</option>
                        <option value="cut">Cut</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`editScheduleActive-${schedule.id}`}
                        className="mr-2"
                        checked={schedule.is_active}
                        onChange={(e) => setSchedules(schedules.map(s => s.id === schedule.id ? { ...s, is_active: e.target.checked } : s))}
                      />
                      <label htmlFor={`editScheduleActive-${schedule.id}`} className="text-xs text-slate-400">Is Active</label>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-qron-primary" />
                      <div>
                        <p className="text-slate-200 text-sm truncate">{schedule.target_image_url}</p>
                        <p className="text-xs text-slate-400">
                          {format(parseISO(schedule.start_time), 'MMM d, yyyy HH:mm')}
                          {schedule.end_time && ` - ${format(parseISO(schedule.end_time), 'MMM d, yyyy HH:mm')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${schedule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                        {schedule.transition_type}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 ml-4">
                  {editingScheduleId === schedule.id ? (
                    <>
                      <button onClick={() => handleUpdateSchedule(schedule as LivingArtSchedule)} className="text-green-500 hover:text-green-400">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingScheduleId(null)} className="text-red-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditingScheduleId(schedule.id)} className="text-slate-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDeleteSchedule(schedule.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
