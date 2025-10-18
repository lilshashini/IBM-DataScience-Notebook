import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, ArrowRight, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getWeekRange } from '../utils/dateUtils';
import Header from '../components/Header';

interface TopPerformer {
  user_id: string;
  user_name: string;
  total_hours: number;
  rank: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [weeklyWinner, setWeeklyWinner] = useState<TopPerformer | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const range = getWeekRange(new Date());

    const { data: workLogs } = await supabase
      .from('work_logs')
      .select('user_id, hours_worked, users(name)')
      .gte('date', range.start)
      .lte('date', range.end);

    const { data: users } = await supabase
      .from('users')
      .select('id');

    setTotalUsers(users?.length || 0);

    if (!workLogs || workLogs.length === 0) return;

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

    setTopPerformers(sorted.slice(0, 3));
    if (sorted.length > 0) {
      setWeeklyWinner(sorted[0]);
      const hasSeenWinner = sessionStorage.getItem('seenWeeklyWinner');
      if (!hasSeenWinner) {
        setShowWinnerModal(true);
        sessionStorage.setItem('seenWeeklyWinner', 'true');
      }
    }
  };

  const motivationalQuotes = [
    "Progress, not perfection.",
    "Every hour counts towards your goals.",
    "Consistency is the key to success.",
    "Track today, celebrate tomorrow.",
    "Small steps lead to big achievements."
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 text-slate-900 dark:text-slate-50 font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-slate-800 dark:to-purple-900 shadow-xl border border-purple-200 dark:border-purple-800 flex flex-col md:flex-row items-center justify-between overflow-hidden mb-16">

          {/* Background pattern/texture */}
          <div className="absolute inset-0 opacity-10 dark:opacity-5 pattern-dots z-0"></div> {/* Assumes a 'pattern-dots' utility or custom CSS */}

          {/* Mascot on the left */}
          <div className="relative z-10 mb-8 md:mb-0 md:mr-10 flex-shrink-0 animate-float">
            <img
              src="/DaDo_clock.svg" // Using our clock mascot prominently
              alt="DayDone Mascot with Clock"
              className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-lg"
            />
          </div>

          {/* Text content on the right */}
          <div className="relative z-10 text-center md:text-left flex-grow">
            <img
              src="/DayDone_logo.svg" // Our custom logo
              alt="DayDone Logo"
              className="h-20 w-auto mx-auto md:mx-0 mb-4 drop-shadow-md"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Unlock Your Potential
              </span>
            </h1>

            <p className="text-lg md:text-xl text-purple-800 dark:text-purple-200 mb-6 max-w-2xl mx-auto md:mx-0 font-light">
              Master your time, track progress, and celebrate achievements — one day at a time.
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 dark:bg-purple-900/40 rounded-full shadow-inner border border-purple-200 dark:border-purple-800 mb-8 md:mb-10">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <p className="text-base font-medium text-purple-700 dark:text-purple-300">
                "{randomQuote}"
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white text-xl font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 active:scale-95 group"
            >
              <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Go to My Dashboard
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Active Users */}
          <div className="card p-8 group relative bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
             {/* Icon with subtle background */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-4xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {totalUsers}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Active Users</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Join our thriving community!</p>
          </div>

          {/* Card 2: This Week's Total Hours */}
          <div className="card p-8 group relative bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Mascot as Icon */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                <img
                  src="/DaDo_working.svg" // Using working mascot for 'This Week's Focus'
                  alt="Mascot Working"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-4xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {topPerformers.reduce((sum, p) => sum + p.total_hours, 0).toFixed(0)}h
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">This Week's Focus</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Total hours logged by all</p>
          </div>

          {/* Card 3: Top Performers */}
          <div className="card p-8 group relative bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Icon with subtle background */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-4xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {topPerformers.length}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Top Performers</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Leading the leaderboard this week</p>
          </div>
        </div>

        {/* Weekly Champions Section */}
        {topPerformers.length > 0 && (
          <div className="card p-8 mb-16 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-purple-200 dark:bg-purple-800/50 rounded-xl shadow-md">
                <Trophy className="w-9 h-9 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Weekly Champions
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  These incredible users are crushing their goals!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((performer, index) => {
                const rankColors = [
                  'from-purple-500 to-purple-700', // 1st
                  'from-purple-400 to-purple-600', // 2nd
                  'from-purple-300 to-purple-500'  // 3rd
                ];
                const badgeText = ['#1', '#2', '#3'];

                // Calculate progress for the bar (example: max 100h)
                const maxHours = Math.max(...topPerformers.map(p => p.total_hours), 1);
                const progressPercentage = (performer.total_hours / maxHours) * 100;

                return (
                  <div
                    key={performer.user_id}
                    className={`relative p-6 rounded-2xl bg-gradient-to-br ${rankColors[index]} text-white border border-purple-300 dark:border-purple-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute top-0 left-0 w-16 h-16 bg-gradient-to-br ${rankColors[index]} rounded-br-full flex items-center justify-center text-white text-2xl font-extrabold shadow-lg`}>
                        {badgeText[index]}
                    </div>

                    <div className="text-center pt-8"> {/* Adjusted padding for badge */}
                      <div className="w-20 h-20 mx-auto mb-4 bg-white/20 dark:bg-slate-700/50 rounded-full flex items-center justify-center border border-white/30 dark:border-slate-600 backdrop-blur-sm shadow-inner">
                        {/* Placeholder for user avatar - could be initials or actual avatar */}
                        <Users className="w-10 h-10 text-white dark:text-purple-300" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {performer.user_name}
                      </h3>
                      <p className="text-4xl font-extrabold mb-1">
                        {performer.total_hours.toFixed(1)}h
                      </p>
                      <p className="text-sm opacity-80 mb-4">
                        ({performer.total_hours.toFixed(0)} points earned)
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/30 rounded-full h-2.5">
                        <div
                          className="bg-white rounded-full h-2.5 shadow-md"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center relative py-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-2xl border border-purple-600 text-white overflow-hidden">
          {/* Background mascot with motion */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 z-0 animate-spin-slow-reverse">
            <Zap className="w-64 h-64 text-white/30" /> {/* Using Zap icon for energy */}
          </div>
          <div className="absolute -bottom-16 right-10 opacity-70 z-0 animate-bounce-slow-sm hidden md:block">
            <img
              src="/DaDo_hurey.svg" // Celebrating mascot for CTA
              alt="Excited DayDone"
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
              Ready to Achieve Your Goals?
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto font-light">
              Join the DayDone journey and start tracking your success, one step at a time.
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-700 text-xl font-semibold rounded-full shadow-2xl hover:shadow-purple-200 transition-all transform hover:scale-105 active:scale-95 group"
            >
              <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform text-purple-600" />
              Join the Journey Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      {showWinnerModal && weeklyWinner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-purple-200 to-white dark:from-slate-700 dark:to-purple-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-purple-300 dark:border-purple-700 animate-zoom-in relative overflow-hidden text-purple-900 dark:text-white">
            {/* Confetti/Stars overlay */}
            <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center">
                <Star className="w-48 h-48 text-purple-400 animate-spin-slow" />
            </div>

            <div className="text-center relative z-10">
              <div className="mb-6">
                <img
                  src="/DaDo_hurey.svg" // Our celebrating mascot
                  alt="Champion!"
                  className="w-32 h-32 mx-auto mb-4 animate-bounce-sm"
                />
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg animate-pulse-fast">
                  <Trophy className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-2 leading-tight">
                  🎉 Weekly Champion!
                </h2>
                <p className="text-2xl font-semibold text-purple-700 dark:text-purple-300 mb-4">
                  {weeklyWinner.user_name}
                </p>
              </div>

              <div className="bg-white/70 dark:bg-slate-700/50 rounded-xl p-5 mb-6 shadow-inner border border-purple-200 dark:border-purple-800">
                <p className="text-5xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                  {weeklyWinner.total_hours.toFixed(1)} hours
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-lg">
                  Outstanding performance this week! Keep it up!
                </p>
              </div>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full font-medium text-xl shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 active:scale-95"
              >
                Awesome! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}