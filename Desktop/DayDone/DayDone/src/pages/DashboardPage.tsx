import { useState } from 'react';
import { useUser } from '../contexts/UserContext.tsx';
import Header from '../components/Header.tsx';
import DashboardMetrics from '../components/DashboardMetrics.tsx';
import DatePicker from '../components/DatePicker.tsx';
import TaskManager from '../components/TaskManager.tsx';
import ContributionGraph from '../components/ContributionGraph.tsx';
import Leaderboard from '../components/Leaderboard.tsx';
import PointsCard from '../components/PointsCard.tsx';
import { Sparkles, Target } from 'lucide-react';

export default function DashboardPage() {
  const { selectedUserId, selectedUser } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTasksUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  // --- A More Magical Welcome Screen ---
  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <Header />
        {/* Background Pattern */}
        <div 
          className="fixed inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#d8c9f5 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center p-8">
            <img 
              src="/DaDo_clock.svg" 
              alt="DayDone Mascot" 
              className="w-48 h-48 mx-auto mb-8 animate-float"
            />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-3">
              Ready to start your day?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
              Please select a user from the top menu to dive into your dashboard and begin tracking your progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- The New, Elegant Dashboard Layout ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/20 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      <Header />

      {/* Animated Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-30 dark:opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#d8c9f5 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        
        {/* Dashboard Title Section with Mascot */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200">
              Welcome back, <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">{selectedUser.name}!</span>
            </h1>
            <img 
              src="/DaDo_hurey.svg" 
              alt="Excited DaDo"
              className="w-16 h-16 animate-bounce"
            />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Here's your progress for Saturday, October 18, 2025. Let's make it a great day!
          </p>
        </div>

        <div key={refreshKey} className="space-y-8">
          
          {/* Top Row: Key Metrics */}
          <div>
            <DashboardMetrics userId={selectedUserId} refreshKey={refreshKey} />
          </div>

          {/* Date Picker Row with Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date Picker */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-shadow duration-300">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Quick Stats Card */}
            <div className="relative bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/40 dark:to-fuchsia-900/40 rounded-2xl shadow-lg shadow-purple-200/50 dark:shadow-purple-900/50 border border-purple-200 dark:border-purple-700 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden min-h-[200px]">
              <img 
                src="/DaDo_working.svg" 
                alt="DaDo Working"
                className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain select-none"
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-purple-700 dark:text-purple-300 text-sm font-semibold mb-1">Today's Progress</p>
                    <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100">65%</h3>
                  </div>
                  <div className="bg-purple-200 dark:bg-purple-800/50 p-3 rounded-xl">
                    <svg className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-purple-200 dark:bg-purple-800/30 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">13/20</span>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Keep going! You're on fire today! 🔥</p>
              </div>
            </div>

            {/* Streak Card */}
            <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-2xl shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50 border border-amber-200 dark:border-amber-700 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden min-h-[200px]">
              <img 
                src="/DaDo_hurey.svg" 
                alt="DaDo Celebrating"
                className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain select-none"
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-amber-700 dark:text-amber-300 text-sm font-semibold mb-1">Current Streak</p>
                    <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100">12 Days</h3>
                  </div>
                  <div className="bg-amber-200 dark:bg-amber-800/50 p-3 rounded-xl">
                    <span className="text-2xl">🔥</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Longest Streak:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">28 days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700 dark:text-amber-300 font-medium">This Month:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">18 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- Left Column: Daily Focus --- */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-purple-50/30 dark:from-slate-800 dark:to-purple-900/20">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Daily Focus</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your tasks for today</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <TaskManager
                    userId={selectedUserId}
                    selectedDate={selectedDate}
                    onTasksUpdated={handleTasksUpdated}
                  />
                </div>
              </div>
            </div>

            {/* --- Right Sidebar --- */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl shadow-lg shadow-purple-200/50 dark:shadow-purple-900/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <PointsCard userId={selectedUserId} />
              </div>
              
              {/* --- Cute Mascot Card --- */}
              <div className="relative rounded-2xl shadow-lg shadow-fuchsia-100/50 dark:shadow-fuchsia-900/30 border border-purple-200 dark:border-purple-800 p-8 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-slate-800 dark:to-purple-900/30 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative z-10 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Keep Going!</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Every task you complete brings you closer to your goals. You're doing amazing work!
                  </p>
                </div>
                <img 
                  src="/DaDo_working.svg" 
                  alt="DayDone Mascot Working"
                  className="w-40 h-40 mx-auto opacity-70 dark:opacity-40 select-none"
                />
              </div>
            </div>
          </div>

          {/* Activity Graph - Full Width Like GitHub */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <ContributionGraph
              userId={selectedUserId}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* Leaderboards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-amber-100/50 dark:shadow-amber-900/30 border-2 border-amber-200 dark:border-amber-800 overflow-hidden hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 border-b-2 border-amber-200 dark:border-amber-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="text-2xl">🏆</span> Top Performers This Week
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">Who's crushing it this week?</p>
              </div>
              <div className="p-6">
                <Leaderboard period="week" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30 border-2 border-purple-200 dark:border-purple-800 overflow-hidden hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-6 border-b-2 border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="text-2xl">👑</span> Top Performers This Month
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400 mt-2">The monthly champions!</p>
              </div>
              <div className="p-6">
                <Leaderboard period="month" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}