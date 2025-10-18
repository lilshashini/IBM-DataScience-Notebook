import { useEffect, useState } from 'react';
import { Trophy, Target, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PointsCardProps {
  userId: string | null;
}

interface UserStats {
  totalPoints: number;
  rank: number;
  totalUsers: number;
  thisWeekPoints: number;
  level: number;
  pointsToNextLevel: number;
}

export default function PointsCard({ userId }: PointsCardProps) {
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    rank: 0,
    totalUsers: 0,
    thisWeekPoints: 0,
    level: 1,
    pointsToNextLevel: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Get all users' total hours for ranking
      const { data: allUserHours, error: rankError } = await supabase
        .from('work_logs')
        .select(`
          hours_worked,
          user_id,
          users!inner(name)
        `);

      if (rankError) {
        console.error('Error fetching rank data:', rankError);
        return;
      }

      // Calculate total points (hours) for each user
      const userPoints = allUserHours?.reduce((acc: Record<string, number>, log: any) => {
        acc[log.user_id] = (acc[log.user_id] || 0) + Number(log.hours_worked);
        return acc;
      }, {}) || {};

      const totalUsers = Object.keys(userPoints).length;
      const userTotalPoints = userId ? userPoints[userId] || 0 : 0;

      // Calculate rank
      const sortedUsers = Object.entries(userPoints).sort(([,a], [,b]) => Number(b) - Number(a));
      const rank = sortedUsers.findIndex(([id]) => id === userId) + 1;

      // Get this week's points
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const { data: weeklyHours } = await supabase
        .from('work_logs')
        .select('hours_worked')
        .eq('user_id', userId)
        .gte('date', weekStart.toISOString().split('T')[0]);

      const thisWeekPoints = weeklyHours?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0;

      // Calculate level (every 100 points = 1 level)
      const level = Math.floor(userTotalPoints / 100) + 1;
      const pointsToNextLevel = 100 - (userTotalPoints % 100);

      setStats({
        totalPoints: userTotalPoints,
        rank: rank || totalUsers,
        totalUsers,
        thisWeekPoints,
        level,
        pointsToNextLevel
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-purple-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className={`w-6 h-6 ${getRankColor(rank)}`} />;
    return <Target className="w-6 h-6 text-purple-600" />;
  };

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Background Mascot */}
      <div className="absolute -bottom-4 -right-4 opacity-10 dark:opacity-5">
        <img 
          src="/DaDo_working.svg" 
          alt="Working DayDone" 
          className="w-24 h-24 object-contain"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Points & Rank
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your progress level
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-4">
          {/* Total Points */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Total Points</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalPoints.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">pts</span>
            </div>
          </div>

          {/* Rank */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Current Rank</span>
            <div className="flex items-center gap-2">
              {getRankIcon(stats.rank)}
              <span className={`text-lg font-semibold ${getRankColor(stats.rank)}`}>
                #{stats.rank}
              </span>
              <span className="text-sm text-slate-500">of {stats.totalUsers}</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Level {stats.level}</span>
              <span className="text-sm text-slate-500">
                {stats.pointsToNextLevel} to next level
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${((100 - stats.pointsToNextLevel) / 100) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* This Week */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">This Week</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  +{stats.thisWeekPoints.toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {stats.rank === 1 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                🎉 You're leading the pack! Keep it up!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}