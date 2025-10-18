import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Calendar, StickyNote, CheckCircle2 } from 'lucide-react';
import { supabase, type Task, type WorkLog } from '../lib/supabase';
import { formatDate } from '../utils/dateUtils';
import AchievementPopup from './AchievementPopup';

interface TaskManagerProps {
  userId: string | null;
  selectedDate: Date;
  onTasksUpdated?: () => void;
}

const taskStatuses = ['Started', 'In Progress', 'Finished', 'Pending', 'On Hold'] as const;

export default function TaskManager({ userId, selectedDate, onTasksUpdated }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workLog, setWorkLog] = useState<WorkLog | null>(null);
  const [hoursWorked, setHoursWorked] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedTaskName, setCompletedTaskName] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [achievementPopup, setAchievementPopup] = useState({
    visible: false,
    message: '',
    type: 'achievement' as 'task' | 'progress' | 'achievement'
  });

  useEffect(() => {
    if (!userId) return;
    fetchWorkLogAndTasks();
  }, [userId, selectedDate]);

  useEffect(() => {
    // Show encouragement when no tasks exist
    if (tasks.length === 0 && !loading) {
      setShowEncouragement(true);
    } else {
      setShowEncouragement(false);
    }
  }, [tasks, loading]);

  const fetchWorkLogAndTasks = async () => {
    if (!userId) return;

    const dateString = formatDate(selectedDate);

    const { data: workLogData } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateString)
      .maybeSingle();

    if (workLogData) {
      setWorkLog(workLogData);
      setHoursWorked(workLogData.hours_worked.toString());
      setNotes(workLogData.notes || '');

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('work_log_id', workLogData.id)
        .order('created_at', { ascending: true });

      setTasks(tasksData || []);
    } else {
      setWorkLog(null);
      setTasks([]);
      setHoursWorked('0');
      setNotes('');
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: `temp-${Date.now()}`,
      work_log_id: '',
      user_id: userId || '',
      task_name: '',
      description: '',
      status: 'Started' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (index: number, field: keyof Task, value: string) => {
    const updated = [...tasks];
    const previousStatus = updated[index].status;
    updated[index] = { ...updated[index], [field]: value };
    
    // Trigger celebration when task is marked as finished
    if (field === 'status' && value === 'Finished' && previousStatus !== 'Finished') {
      setCompletedTaskName(updated[index].task_name);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    setTasks(updated);
  };

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    console.log('🚀 handleSave triggered', { userId, hoursWorked, tasksCount: tasks.length });
    
    if (!userId) {
      console.error('No user ID provided');
      setAchievementPopup({
        visible: true,
        message: 'No user selected. Please select a user first.',
        type: 'progress'
      });
      return;
    }

    setLoading(true);
    try {
      const dateString = formatDate(selectedDate);
      let currentWorkLog = workLog;
      let newTasksAdded = 0;
      let isNewWorkLog = false;

      // Create or update work log
      if (!currentWorkLog) {
        const { data: newWorkLog, error: workLogError } = await supabase
          .from('work_logs')
          .insert([{
            user_id: userId,
            date: dateString,
            hours_worked: parseFloat(hoursWorked) || 0,
            notes
          }])
          .select()
          .single();

        if (workLogError) {
          console.error('Error creating work log:', workLogError);
          throw workLogError;
        }

        currentWorkLog = newWorkLog;
        setWorkLog(newWorkLog);
        isNewWorkLog = true;
      } else {
        const { error: updateError } = await supabase
          .from('work_logs')
          .update({
            hours_worked: parseFloat(hoursWorked) || 0,
            notes
          })
          .eq('id', currentWorkLog.id);

        if (updateError) {
          console.error('Error updating work log:', updateError);
          throw updateError;
        }
      }

      // Handle task operations
      const existingTaskIds = tasks
        .filter(t => !t.id.startsWith('temp-'))
        .map(t => t.id);

      if (currentWorkLog) {
        const { data: currentTasks, error: fetchError } = await supabase
          .from('tasks')
          .select('id')
          .eq('work_log_id', currentWorkLog.id);

        if (fetchError) {
          console.error('Error fetching current tasks:', fetchError);
        }

        // Delete removed tasks
        const tasksToDelete = (currentTasks || [])
          .filter(t => !existingTaskIds.includes(t.id))
          .map(t => t.id);

        if (tasksToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('tasks')
            .delete()
            .in('id', tasksToDelete);

          if (deleteError) {
            console.error('Error deleting tasks:', deleteError);
          }
        }

        // Process each task
        for (const task of tasks) {
          if (task.id.startsWith('temp-')) {
            // Insert new task
            if (task.task_name.trim()) { // Only insert tasks with names
              const { error: insertError } = await supabase
                .from('tasks')
                .insert([{
                  work_log_id: currentWorkLog.id,
                  user_id: userId,
                  task_name: task.task_name,
                  description: task.description || null,
                  status: task.status
                }]);

              if (insertError) {
                console.error('Error inserting task:', insertError);
                throw insertError;
              }
              newTasksAdded++;
            }
          } else {
            // Update existing task
            const { error: updateError } = await supabase
              .from('tasks')
              .update({
                task_name: task.task_name,
                description: task.description || null,
                status: task.status
              })
              .eq('id', task.id);

            if (updateError) {
              console.error('Error updating task:', updateError);
              throw updateError;
            }
          }
        }
      }

      // Refresh data
      await fetchWorkLogAndTasks();
      if (onTasksUpdated) onTasksUpdated();

      // Always show achievement popup when save is successful
      let message = 'Your progress has been saved successfully!';
      let type: 'task' | 'progress' | 'achievement' = 'progress';
      
      if (newTasksAdded > 0) {
        message = `${newTasksAdded} new task${newTasksAdded > 1 ? 's' : ''} added successfully!`;
        type = 'task';
      } else if (isNewWorkLog) {
        message = 'Work log created and saved successfully!';
        type = 'progress';
      }

      console.log('🎉 Save successful, showing achievement popup:', { message, type });
      setAchievementPopup({
        visible: true,
        message,
        type
      });
    } catch (error) {
      console.error('Error saving data:', error);
      
      // Get more specific error message
      let errorMessage = 'Error saving data. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'A record for this date already exists.';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Invalid user ID. Please refresh and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Check your connection.';
        } else {
          errorMessage = `Save failed: ${error.message}`;
        }
      }
      
      // Show error popup
      setAchievementPopup({
        visible: true,
        message: errorMessage,
        type: 'progress'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'Started': return `${baseClasses} status-started`;
      case 'In Progress': return `${baseClasses} status-in-progress`;
      case 'Finished': return `${baseClasses} status-finished`;
      case 'Pending': return `${baseClasses} status-pending`;
      case 'On Hold': return `${baseClasses} status-on-hold`;
      default: return `${baseClasses} status-pending`;
    }
  };

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center celebrate">
            <img 
              src="/DaDo_hurey.svg" 
              alt="Celebration!" 
              className="w-32 h-32 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              🎉 Task Completed!
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              "{completedTaskName}" - Great job!
            </p>
          </div>
        </div>
      )}

      {/* Background Mascot for Encouragement */}
      {showEncouragement && (
        <div className="absolute bottom-4 right-4 opacity-20 dark:opacity-10">
          <img 
            src="/DaDo_clock.svg" 
            alt="DayDone Clock" 
            className="w-20 h-20 mascot-fade-in"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Daily Focus
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {formatDate(selectedDate)}
          </p>
        </div>
      </div>

      {/* Work Hours & Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Hours Worked
          </label>
          <input
            type="number"
            step="0.5"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all"
            placeholder="8.0"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Daily Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none transition-all"
            placeholder="What did you accomplish today?"
          />
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Tasks
            {tasks.length > 0 && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm px-2 py-1 rounded-full">
                {tasks.filter(t => t.status === 'Finished').length}/{tasks.length}
              </span>
            )}
          </h3>
          <button
            onClick={handleAddTask}
            className="btn-purple flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
            </div>
            <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
              No tasks yet
            </h4>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              Add your first task to get started on your daily goals!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={task.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 hover:border-purple-200 dark:hover:border-purple-800 transition-colors group">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={task.task_name}
                    onChange={(e) => handleUpdateTask(index, 'task_name', e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all"
                  />
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTask(index, 'status', e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-w-[120px] transition-all"
                  >
                    {taskStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeleteTask(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <textarea
                    value={task.description || ''}
                    onChange={(e) => handleUpdateTask(index, 'description', e.target.value)}
                    placeholder="Add details about this task..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm resize-none mr-3 transition-all"
                  />
                  <div className={getStatusBadge(task.status)}>
                    {task.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-8 w-full btn-purple flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Saving...
          </>
        ) : (
          'Save Progress'
        )}
      </button>

      {/* Achievement Popup */}
      <AchievementPopup
        isVisible={achievementPopup.visible}
        message={achievementPopup.message}
        type={achievementPopup.type}
        onClose={() => setAchievementPopup({ visible: false, message: '', type: 'achievement' })}
      />
    </div>
  );
}
