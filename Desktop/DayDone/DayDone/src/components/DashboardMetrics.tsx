import { useEffect, useState } from 'react';
import { Clock, Target, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDate, getWeekRange, getMonthRange, getYearRange } from '../utils/dateUtils';

interface MetricsProps {
  userId: string | null;
  refreshKey?: number;
}

export default function DashboardMetrics({ userId, refreshKey }: MetricsProps) {
  const [metrics, setMetrics] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0
  });
  const [loading, setLoading] = useState(true);

  const targets = {
    daily: 10,
    weekly: 70,
    monthly: 280
  };

  useEffect(() => {
    if (!userId) return;
    fetchMetrics();
  }, [userId, refreshKey]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const today = formatDate(new Date());
      const weekRange = getWeekRange(new Date());
      const monthRange = getMonthRange(new Date());
      const yearRange = getYearRange(new Date());

      const [todayData, weekData, monthData, yearData] = await Promise.all([
        supabase.from('work_logs').select('hours_worked').eq('user_id', userId).eq('date', today).maybeSingle(),
        supabase.from('work_logs').select('hours_worked').eq('user_id', userId).gte('date', weekRange.start).lte('date', weekRange.end),
        supabase.from('work_logs').select('hours_worked').eq('user_id', userId).gte('date', monthRange.start).lte('date', monthRange.end),
        supabase.from('work_logs').select('hours_worked').eq('user_id', userId).gte('date', yearRange.start).lte('date', yearRange.end)
      ]);

      setMetrics({
        today: todayData.data?.hours_worked || 0,
        week: weekData.data?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0,
        month: monthData.data?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0,
        year: yearData.data?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CircularProgress = ({ percentage, size = 80, strokeWidth = 6 }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="circular-progress"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="dark:stroke-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#purpleGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    target,
    gradient,
    iconColor
  }: {
    title: string;
    value: number;
    icon: any;
    target?: number;
    gradient: string;
    iconColor: string;
  }) => {
    const percentage = target ? Math.min((value / target) * 100, 100) : 0;

    if (loading) {
      return (
        <div className="card p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      );
    }

    return (
      <div className="card p-6 group hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          
          {/* Circular Progress */}
          {target ? (
            <CircularProgress percentage={percentage} size={72} strokeWidth={5} />
          ) : (
            <div className="flex items-center justify-center w-18 h-18">
              <span className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {value.toFixed(0)}h
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-2">{title}</h3>
        
        {/* Value and Target */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value.toFixed(1)}h
          </span>
          {target && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              / {target}h
            </span>
          )}
        </div>

        {/* Progress Status */}
        {target && (
          <div className="mt-3">
            {percentage >= 100 ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Target Achieved! 🎉</span>
              </div>
            ) : percentage >= 80 ? (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Almost there!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-sm">Keep going!</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Today's Hours"
        value={metrics.today}
        icon={Clock}
        target={targets.daily}
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        iconColor="text-white"
      />
      <MetricCard
        title="This Week"
        value={metrics.week}
        icon={TrendingUp}
        target={targets.weekly}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
        iconColor="text-white"
      />
      <MetricCard
        title="This Month"
        value={metrics.month}
        icon={Target}
        target={targets.monthly}
        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        iconColor="text-white"
      />
      <MetricCard
        title="This Year"
        value={metrics.year}
        icon={Award}
        gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        iconColor="text-white"
      />
    </div>
  );
}
