'use client'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { createClient } from '@/lib/supabase/client'
import { BIBLE_ABBREVIATIONS } from '@/lib/bibleAbbreviations'
import type { User } from '@supabase/supabase-js'

interface CalendarViewProps {
  plan: { [date: string]: string[] };
  progress: Set<string>;
  setProgress: React.Dispatch<React.SetStateAction<Set<string>>>;
  user: User;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarView({ plan, progress, setProgress, user }: CalendarViewProps) {
  const supabase = createClient()

  const handleDayClick = async (value: Date) => {
    const dateString = value.toISOString().split('T')[0]
    if (!plan[dateString]) return

    const isCompleted = progress.has(dateString)
    const originalProgress = new Set(progress)

    // Optimistic UI update
    const newProgress = new Set(originalProgress)
    if (isCompleted) {
      newProgress.delete(dateString)
    } else {
      newProgress.add(dateString)
    }
    setProgress(newProgress)

    // Update database
    const operation = isCompleted
      ? supabase.from('progress').delete().match({ user_id: user.id, read_date: dateString })
      : supabase.from('progress').insert({ read_date: dateString, user_id: user.id })

    const { error } = await operation

    if (error) {
      console.error("Failed to update progress:", error)
      setProgress(originalProgress) // Revert on error
    }
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0]
      const dayPlan = plan[dateString]
      if (dayPlan) {
        const abbreviatedPlan = dayPlan.map(reading => {
          const parts = reading.split(' ');
          const bookName = parts.slice(0, -1).join(' ');
          const chapters = parts[parts.length - 1];
          const abbr = BIBLE_ABBREVIATIONS[bookName] || bookName;
          return `${abbr} ${chapters}`;
        });
        return (
          <div className="text-xs p-1 text-gray-700">
            {abbreviatedPlan.map((reading, i) => (
              <p key={i}>{reading}</p>
            ))}
          </div>
        )
      }
    }
    return null
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0]
      if (progress.has(dateString)) {
        return 'bg-green-300 rounded-lg' // Completed
      }
      if (plan[dateString]) {
        return 'bg-yellow-100 rounded-lg' // Planned but not completed
      }
    }
    return null
  }

  return (
    <div className="calendar-container">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <LegendItem color="bg-green-400" label="已完成" />
        <LegendItem color="bg-yellow-300" label="待完成" />
        <LegendItem color="bg-blue-300" label="今日" />
        <LegendItem color="bg-gray-100" label="無計劃" />
      </div>

      <Calendar
        locale="en-US" // Force Sunday start
        formatMonthYear={(locale, date) => `${date.getFullYear()}年${date.getMonth() + 1}月`}
        formatShortWeekday={(locale, date) => WEEKDAYS[date.getDay()]}
        onClickDay={handleDayClick}
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="w-full border-none modern-calendar"
      />
      
      <style jsx global>{`
        /* Modern Calendar Styles */
        .modern-calendar {
          font-family: 'Inter', sans-serif;
        }
        
        .react-calendar {
          border: none !important;
          background: transparent !important;
          width: 100% !important;
          max-width: none !important;
        }
        
        .react-calendar__navigation {
          margin-bottom: 1.5rem !important;
          height: auto !important;
        }
        
        .react-calendar__navigation button {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 12px !important;
          color: #374151 !important;
          font-weight: 600 !important;
          padding: 12px 16px !important;
          margin: 0 4px !important;
          transition: all 0.3s ease !important;
        }
        
        .react-calendar__navigation button:hover {
          background: #f3f4f6 !important;
          border-color: #6366f1 !important;
          transform: translateY(-1px) !important;
        }
        
        .react-calendar__navigation button:disabled {
          background: #f9fafb !important;
          color: #9ca3af !important;
        }
        
        .react-calendar__month-view__weekdays {
          margin-bottom: 1rem !important;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          padding: 12px 8px !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          font-size: 0.875rem !important;
          text-align: center !important;
        }
        
        .react-calendar__tile {
          background: white !important;
          border: 2px solid #f3f4f6 !important;
          border-radius: 12px !important;
          margin: 3px !important;
          padding: 12px 8px !important;
          min-height: 100px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          font-weight: 600 !important;
          flex: 1 !important;
        }
        
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 6px !important;
          width: 100% !important;
        }
        
        .react-calendar__month-view__days__day {
          width: 100% !important;
          aspect-ratio: 1 !important;
        }
        
        @media (min-width: 769px) {
          .react-calendar__tile {
            min-height: 120px !important;
            padding: 16px 12px !important;
          }
          
          .react-calendar__month-view__days {
            gap: 8px !important;
          }
          
          .react-calendar__tile abbr {
            font-size: 1.125rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .react-calendar__tile {
            min-height: 60px !important;
            padding: 4px 2px !important;
            margin: 1px !important;
          }
          
          .react-calendar__month-view__weekdays__weekday {
            padding: 8px 4px !important;
            font-size: 0.75rem !important;
          }
          
          .react-calendar__navigation button {
            padding: 8px 12px !important;
            font-size: 0.875rem !important;
          }
          
          .react-calendar__month-view__days {
            gap: 2px !important;
          }
        }
        
        .react-calendar__tile:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          border-color: #6366f1 !important;
        }
        
        .react-calendar__tile--now {
          background: #dbeafe !important;
          border-color: #3b82f6 !important;
          color: #1e40af !important;
        }
        
        .react-calendar__tile--now:hover {
          background: #bfdbfe !important;
        }
        
        /* 已完成的日期 */
        .react-calendar__tile.bg-green-300 {
          background: #86efac !important;
          border-color: #22c55e !important;
          color: #166534 !important;
        }
        
        .react-calendar__tile.bg-green-300:hover {
          background: #4ade80 !important;
          border-color: #16a34a !important;
        }
        
        /* 有計劃但未完成的日期 */
        .react-calendar__tile.bg-yellow-100 {
          background: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }
        
        .react-calendar__tile.bg-yellow-100:hover {
          background: #fde047 !important;
          border-color: #d97706 !important;
        }
        
        /* 今日且已完成 */
        .react-calendar__tile--now.bg-green-300 {
          background: #86efac !important;
          border-color: #22c55e !important;
          color: #166534 !important;
        }
        
        /* 今日且有計劃 */
        .react-calendar__tile--now.bg-yellow-100 {
          background: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }
        
        .react-calendar__tile abbr {
          text-decoration: none !important;
          font-size: 1rem !important;
          font-weight: 700 !important;
        }
        
        @media (max-width: 768px) {
          .react-calendar__tile abbr {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-4 h-4 ${color} rounded border-2 border-gray-300`}></div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
