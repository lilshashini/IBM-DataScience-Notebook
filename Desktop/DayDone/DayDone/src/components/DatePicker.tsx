import Calendar from 'react-calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Date Picker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a date to focus on
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
        <Calendar
          onChange={(value) => onDateChange(value as Date)}
          value={selectedDate}
          className="w-full"
        />
      </div>
    </div>
  );
}
