import { useEffect, useState } from 'react';
import { Trophy, Award, Medal, Crown, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getWeekRange, getMonthRange } from '../utils/dateUtils';
import { useUser } from '../contexts/UserContext';

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  total_hours: number;
  rank: number;
}

interface LeaderboardProps {
  period: 'week' | 'month';
}

export default function Leaderboard({ period }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedUser } = useUser();

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const range = period === 'week' ? getWeekRange(new Date()) : getMonthRange(new Date());

      const { data: workLogs } = await supabase
        .from('work_logs')
        .select('user_id, hours_worked, users(name)')
        .gte('date', range.start)
        .lte('date', range.end);

      if (!workLogs) return;

      const userHours = new Map<string, { name: string; hours: number }>();

      workLogs.forEach((log: any) => {
        const userId = log.user_id;
        const hours = Number(log.hours_worked);
        const userName = log.users?.name || 'Unknown';

        if (userHours.has(userId)) {
          const existing = userHours.get(userId)!;
          existing.hours += hours;
        } else {
          userHours.set(userId, { name: userName, hours });
        }
      });

      const sorted = Array.from(userHours.entries())
        .map(([user_id, data]) => ({
          user_id,
          user_name: data.name,
          total_hours: data.hours,
          rank: 0
        }))
        .sort((a, b) => b.total_hours - a.total_hours)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboard(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };



  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-20';
      case 2: return 'h-16';
      case 3: return 'h-12';
      default: return 'h-8';
    }
  };

  const currentUserRank = selectedUser ? leaderboard.find(entry => entry.user_id === selectedUser.id) : null;
  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3, 8);

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-2/3"></div>
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Leaderboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Top performers this {period}
          </p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-slate-500 mb-4">
            <Trophy className="w-12 h-12 mx-auto mb-3" />
          </div>
          <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No activity yet
          </h4>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Start tracking work hours to see the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Podium for Top 3 */}
          {top3.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
              <div className="flex items-end justify-center gap-4 mb-4">
                {/* 2nd place */}
                {top3[1] && (
                  <div className="text-center flex-1 max-w-24">
                    <div className="mb-2">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500 rounded-t-lg ${getPodiumHeight(2)} flex items-end justify-center pb-2`}>
                      <Trophy className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 truncate">
                      {top3[1].user_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {top3[1].total_hours.toFixed(1)}h
                    </p>
                  </div>
                )}

                {/* 1st place */}
                <div className="text-center flex-1 max-w-24">
                  <div className="mb-2">
                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl relative">
                      <Crown className="w-6 h-6 text-white" />
                      <div className="absolute -top-2 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-t from-yellow-400 to-yellow-300 dark:from-yellow-600 dark:to-yellow-500 rounded-t-lg ${getPodiumHeight(1)} flex items-end justify-center pb-2`}>
                    <Crown className="w-6 h-6 text-yellow-800 dark:text-yellow-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
                    {top3[0].user_name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {top3[0].total_hours.toFixed(1)}h
                  </p>
                </div>

                {/* 3rd place */}
                {top3[2] && (
                  <div className="text-center flex-1 max-w-24">
                    <div className="mb-2">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-t from-amber-300 to-amber-200 dark:from-amber-600 dark:to-amber-500 rounded-t-lg ${getPodiumHeight(3)} flex items-end justify-center pb-2`}>
                      <Medal className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 truncate">
                      {top3[2].user_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {top3[2].total_hours.toFixed(1)}h
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          {restOfLeaderboard.length > 0 && (
            <div className="space-y-2">
              {restOfLeaderboard.map((entry) => {
                const isCurrentUser = selectedUser && entry.user_id === selectedUser.id;
                return (
                  <div
                    key={entry.user_id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-all duration-200
                      ${
                        isCurrentUser
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                          #{entry.rank}
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isCurrentUser 
                            ? 'text-purple-700 dark:text-purple-300' 
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {entry.user_name}
                          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {entry.total_hours.toFixed(1)} hours
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {entry.total_hours.toFixed(0)} pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current user rank if not in top 8 */}
          {currentUserRank && currentUserRank.rank > 8 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                      #{currentUserRank.rank}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-purple-700 dark:text-purple-300">
                      {currentUserRank.user_name} (You)
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currentUserRank.total_hours.toFixed(1)} hours
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {currentUserRank.total_hours.toFixed(0)} pts
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
