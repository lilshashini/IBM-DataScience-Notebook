import { Moon, Sun, Crown, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import UserSelector from './UserSelector';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WeeklyWinner {
  name: string;
  hours: number;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { selectedUser } = useUser();
  const [weeklyWinner, setWeeklyWinner] = useState<WeeklyWinner | null>(null);
  const [showWinnerNotification, setShowWinnerNotification] = useState(false);

  useEffect(() => {
    fetchWeeklyWinner();
  }, []);

  const fetchWeeklyWinner = async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const { data: workLogs, error } = await supabase
        .from('work_logs')
        .select(`
          hours_worked,
          users!inner(name)
        `)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      if (!error && workLogs) {
        const userHours = workLogs.reduce((acc: Record<string, { name: string; hours: number }>, log: any) => {
          const userName = log.users.name;
          if (!acc[userName]) {
            acc[userName] = { name: userName, hours: 0 };
          }
          acc[userName].hours += Number(log.hours_worked);
          return acc;
        }, {});

        const winner = Object.values(userHours).reduce((max, user) => 
          user.hours > max.hours ? user : max, { name: '', hours: 0 }
        );

        if (winner.name && winner.hours > 0) {
          setWeeklyWinner(winner);
          setShowWinnerNotification(true);
        }
      }
    } catch (error) {
      console.error('Error fetching weekly winner:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg">
      {/* Weekly Winner Banner */}
      {weeklyWinner && showWinnerNotification && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium winner-banner">
              <Crown className="w-4 h-4" />
              <span>🎉 Weekly Winner: {weeklyWinner.name} with {weeklyWinner.hours}h!</span>
            </div>
            <button
              onClick={() => setShowWinnerNotification(false)}
              className="text-purple-100 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <img 
              src="/DayDone_logo.svg" 
              alt="DayDone" 
              className="h-25 w-auto object-contain"
            />
            {selectedUser && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="text-slate-600 dark:text-slate-400">Hi,</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {selectedUser.name}!
                </span>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            {weeklyWinner && !showWinnerNotification && (
              <button
                onClick={() => setShowWinnerNotification(true)}
                className="relative p-2 text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors"
                title="Weekly Winner"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </button>
            )}
            
            <UserSelector />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 transform hover:scale-105"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
