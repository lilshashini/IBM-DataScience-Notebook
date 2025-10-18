import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Assuming your supabase client is here
import { getDaysInYear } from '../utils/dateUtils'; // Assuming your date utils are here
import { format, parseISO, getDay, getMonth, startOfMonth } from 'date-fns';

// A utility for conditionally joining class names
const clsx = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface TooltipData {
  date: string;
  hours: number;
  x: number;
  y: number;
}

interface ContributionGraphProps {
  userId: string | null;
  onDateSelect?: (date: Date) => void;
}

export default function ContributionGraph({ userId, onDateSelect }: ContributionGraphProps) {
  const [workLogsMap, setWorkLogsMap] = useState<Map<string, number>>(new Map());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ date: string; hours: number } | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchWorkLogs = async () => {
      const { data } = await supabase
        .from('work_logs')
        .select('date, hours_worked')
        .eq('user_id', userId)
        .gte('date', `${selectedYear}-01-01`)
        .lte('date', `${selectedYear}-12-31`);

      const map = new Map<string, number>();
      data?.forEach(log => {
        map.set(log.date, Number(log.hours_worked));
      });
      setWorkLogsMap(map);
      setSelectedDay(null); // Reset selection on year change
    };

    fetchWorkLogs();
  }, [userId, selectedYear]);

  // Memoize grid calculation to avoid re-running on every render
  const { weeks, monthLabels } = (() => {
    const days = getDaysInYear(selectedYear);
    const weeks: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];

    const firstDayOfYear = parseISO(days[0]);
    const startDayOfWeek = getDay(firstDayOfYear) === 0 ? 6 : getDay(firstDayOfYear) - 1; // Mon=0, Sun=6

    // Add empty placeholders for days before the year starts
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add final week if it's not full
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    // Generate month labels
    const monthLabels: { name: string, colStart: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
        const firstDayOfWeek = week.find(d => d);
        if(!firstDayOfWeek) return;
        const month = getMonth(parseISO(firstDayOfWeek));
        if (month !== lastMonth) {
            monthLabels.push({ name: format(parseISO(firstDayOfWeek), 'MMM'), colStart: i + 1 });
            lastMonth = month;
        }
    });

    return { weeks, monthLabels };
  })();

  const getColorIntensity = (hours: number): string => {
    if (hours === 0) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700/50';
    if (hours < 3) return 'bg-purple-200 dark:bg-purple-900/40 border-purple-300/50 dark:border-purple-800/50';
    if (hours < 6) return 'bg-purple-400 dark:bg-purple-700/60 border-purple-400/50 dark:border-purple-600/50';
    if (hours < 9) return 'bg-purple-600 dark:bg-purple-500/80 border-purple-600/50 dark:border-purple-500/50';
    return 'bg-purple-800 dark:bg-purple-400 border-purple-800/50 dark:border-purple-400/50';
  };

  const handleDayClick = (date: string) => {
    if (!date) return;
    const hours = workLogsMap.get(date) || 0;
    setSelectedDay({ date, hours });

    if (onDateSelect) {
      onDateSelect(parseISO(date));
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>, day: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const hours = workLogsMap.get(day) || 0;
    setTooltip({
      date: day,
      hours,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    });
  };

  const totalHours = Array.from(workLogsMap.values()).reduce((sum, hours) => sum + hours, 0);
  const activeDays = Array.from(workLogsMap.values()).filter(hours => hours > 0).length;
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="card bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Activity Graph
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300 h-5">
                 {selectedDay 
                    ? <span className="font-bold text-purple-600 dark:text-purple-400">{`${selectedDay.hours} hour(s) on ${format(parseISO(selectedDay.date), 'MMMM d, yyyy')}`}</span>
                    : `${totalHours} hours this year • ${activeDays} active days`
                 }
                </p>
            </div>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Graph Body */}
      <div className="relative">
        {/* Month Labels */}
        <div className="grid grid-flow-col" style={{ gridTemplateColumns: `repeat(${weeks.length}, 16px)`, gap: '4px', paddingLeft: '28px' }}>
          {monthLabels.map(({ name, colStart }) => (
             <div key={name} className="text-xs text-gray-500 dark:text-gray-400 -translate-y-1" style={{ gridColumn: colStart }}>
               {name}
             </div>
          ))}
        </div>
      
        <div className="flex gap-1">
          {/* Day Labels (Mon, Wed, Fri) */}
          <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 mt-[-2px] pr-2 w-[28px]">
            <div className="h-4"></div>
            <div className="h-4">Mon</div>
            <div className="h-4"></div>
            <div className="h-4">Wed</div>
            <div className="h-4"></div>
            <div className="h-4">Fri</div>
            <div className="h-4"></div>
          </div>
          
          {/* Activity Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) return <div key={`${weekIndex}-${dayIndex}`} className="w-4 h-4" />;
                  
                  const hours = workLogsMap.get(day) || 0;
                  const colorClass = getColorIntensity(hours);
                  const isToday = day === format(new Date(), 'yyyy-MM-dd');
                  const isSelected = selectedDay?.date === day;

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={(e) => handleMouseEnter(e, day)}
                      onMouseLeave={() => setTooltip(null)}
                      className={clsx(
                        'w-4 h-4 rounded-sm border transition-all duration-200',
                        colorClass,
                        'cursor-pointer hover:scale-110 hover:shadow-lg',
                        isToday && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-purple-500',
                        isSelected && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-blue-500'
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="mr-2">Less</span>
          <div className="flex gap-1">
              <div className="w-3.5 h-3.5 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50" />
              <div className="w-3.5 h-3.5 rounded-sm bg-purple-200 dark:bg-purple-900/40" />
              <div className="w-3.5 h-3.5 rounded-sm bg-purple-400 dark:bg-purple-700/60" />
              <div className="w-3.5 h-3.5 rounded-sm bg-purple-600 dark:bg-purple-500/80" />
              <div className="w-3.5 h-3.5 rounded-sm bg-purple-800 dark:bg-purple-400" />
          </div>
          <span className="ml-2">More</span>
        </div>
      </div>
      
      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 px-3 py-1.5 text-sm text-white bg-gray-800 dark:bg-gray-700 rounded-md shadow-lg pointer-events-none transition-opacity duration-150"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          {tooltip.hours} hour(s) on {format(parseISO(tooltip.date), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}