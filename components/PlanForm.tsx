'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/lib/bibleData'
import type { User } from '@supabase/supabase-js'

interface PlanFormProps {
  existingPlan: {
    start_date: string;
    chapters_per_day: number;
    reading_order: string;
  } | null;
}

export default function PlanForm({ existingPlan }: PlanFormProps) {
  const [user, setUser] = useState<User | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [chaptersPerDay, setChaptersPerDay] = useState(4) // Default to 4 for 3:1 ratio
  const [readingOrder, setReadingOrder] = useState('ot_nt')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()

    if (existingPlan) {
      setStartDate(existingPlan.start_date)
      setChaptersPerDay(existingPlan.chapters_per_day)
      setReadingOrder(existingPlan.reading_order)
    }
  }, [supabase.auth, existingPlan])

  const generatePlan = () => {
    const plan: { [date: string]: string[] } = {};
    // Fix 1: Correctly handle start date to avoid timezone issues
    let currentDate = new Date(startDate + 'T00:00:00'); 

    const formatDailyReading = (chapters: { book: string; chapter: number }[]) => {
      if (!chapters.length) return [];
      const readings: { [book: string]: number[] } = {};
      chapters.forEach(c => {
        if (!readings[c.book]) readings[c.book] = [];
        readings[c.book].push(c.chapter);
      });
      return Object.entries(readings).map(([book, chaps]) => {
        chaps.sort((a, b) => a - b);
        const first = chaps[0];
        const last = chaps[chaps.length - 1];
        if (first === last) return `${book} ${first}`;
        return `${book} ${first}-${last}`;
      });
    };

    if (readingOrder === 'parallel') {
      const ot = OLD_TESTAMENT_BOOKS.flatMap(b => Array.from({ length: b.chapters }, (_, i) => ({ book: b.name, chapter: i + 1 })))
      const nt = NEW_TESTAMENT_BOOKS.flatMap(b => Array.from({ length: b.chapters }, (_, i) => ({ book: b.name, chapter: i + 1 })))
      let otIdx = 0, ntIdx = 0;
      
      // 計算總章數和理想比例
      const totalOtChapters = ot.length; // 929章
      const totalNtChapters = nt.length; // 260章
      const totalChapters = totalOtChapters + totalNtChapters;
      
      // 計算理想的完成比例，讓兩約大約同時完成
      const otRatio = totalOtChapters / totalChapters; // 約 0.78
      const ntRatio = totalNtChapters / totalChapters; // 約 0.22

      while (otIdx < ot.length || ntIdx < nt.length) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // 計算剩餘章數
        const remainingOt = ot.length - otIdx;
        const remainingNt = nt.length - ntIdx;
        const totalRemaining = remainingOt + remainingNt;
        
        let otPerDay, ntPerDay;
        
        if (remainingOt === 0) {
          // 舊約已讀完，全部章數給新約
          otPerDay = 0;
          ntPerDay = Math.min(chaptersPerDay, remainingNt);
        } else if (remainingNt === 0) {
          // 新約已讀完，全部章數給舊約
          otPerDay = Math.min(chaptersPerDay, remainingOt);
          ntPerDay = 0;
        } else {
          // 兩約都未讀完，動態分配以保持同步
          // 計算當前進度比例
          const otProgress = otIdx / totalOtChapters;
          const ntProgress = ntIdx / totalNtChapters;
          
          if (Math.abs(otProgress - ntProgress) < 0.05) {
            // 進度相近，按理想比例分配
            otPerDay = Math.max(1, Math.round(chaptersPerDay * otRatio));
            ntPerDay = Math.max(1, chaptersPerDay - otPerDay);
          } else if (otProgress < ntProgress) {
            // 舊約落後，多分配給舊約
            otPerDay = Math.max(1, Math.ceil(chaptersPerDay * 0.8));
            ntPerDay = Math.max(1, chaptersPerDay - otPerDay);
          } else {
            // 新約落後，多分配給新約
            ntPerDay = Math.max(1, Math.ceil(chaptersPerDay * 0.4));
            otPerDay = Math.max(1, chaptersPerDay - ntPerDay);
          }
          
          // 確保不超過剩餘章數
          otPerDay = Math.min(otPerDay, remainingOt);
          ntPerDay = Math.min(ntPerDay, remainingNt);
          
          // 如果有剩餘的每日章數，分配給有更多剩餘章數的約
          const usedChapters = otPerDay + ntPerDay;
          const extraChapters = chaptersPerDay - usedChapters;
          
          if (extraChapters > 0) {
            if (remainingOt > remainingNt) {
              otPerDay += Math.min(extraChapters, remainingOt - otPerDay);
            } else {
              ntPerDay += Math.min(extraChapters, remainingNt - ntPerDay);
            }
          }
        }
        
        const dailyOt = otIdx < ot.length ? ot.slice(otIdx, otIdx + otPerDay) : [];
        const dailyNt = ntIdx < nt.length ? nt.slice(ntIdx, ntIdx + ntPerDay) : [];
        const daily = [...dailyOt, ...dailyNt];
        
        if (daily.length > 0) {
          plan[dateStr] = formatDailyReading(daily);
        }
        
        otIdx += otPerDay; 
        ntIdx += ntPerDay;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      const bookOrder = readingOrder === 'ot_nt' ? [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS] : [...NEW_TESTAMENT_BOOKS, ...OLD_TESTAMENT_BOOKS];
      const allChaps = bookOrder.flatMap(b => Array.from({ length: b.chapters }, (_, i) => ({ book: b.name, chapter: i + 1 })));
      for (let i = 0; i < allChaps.length; i += chaptersPerDay) {
        const chunk = allChaps.slice(i, i + chaptersPerDay);
        const dateStr = currentDate.toISOString().split('T')[0];
        plan[dateStr] = formatDailyReading(chunk);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return plan;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) { setError('用戶未登入'); return; }
    setIsLoading(true); setError(null);

    const generated_plan = generatePlan();

    const { error: upsertError } = await supabase.from('reading_plans').upsert({
      user_id: user.id,
      start_date: startDate,
      chapters_per_day: chaptersPerDay,
      reading_order: readingOrder,
      generated_plan: generated_plan,
    }, { onConflict: 'user_id' });

    setIsLoading(false);
    if (upsertError) {
      setError(upsertError.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">{existingPlan ? '更新您的讀經計劃' : '制定我的讀經計劃'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">計劃開始日期</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div>
            <label htmlFor="chaptersPerDay" className="block text-sm font-medium text-gray-700">每日閱讀章數</label>
            <input type="number" id="chaptersPerDay" value={chaptersPerDay} onChange={(e) => setChaptersPerDay(parseInt(e.target.value, 10))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" min="1" max="150" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">閱讀順序</label>
            <div className="mt-2 space-y-2">
                <div className="flex items-center"><input id="ot_nt" type="radio" value="ot_nt" checked={readingOrder === 'ot_nt'} onChange={(e) => setReadingOrder(e.target.value)} className="h-4 w-4" /><label htmlFor="ot_nt" className="ml-3">先舊約，後新約</label></div>
                <div className="flex items-center"><input id="nt_ot" type="radio" value="nt_ot" checked={readingOrder === 'nt_ot'} onChange={(e) => setReadingOrder(e.target.value)} className="h-4 w-4" /><label htmlFor="nt_ot" className="ml-3">先新約，後舊約</label></div>
                <div className="flex items-center"><input id="parallel" type="radio" value="parallel" checked={readingOrder === 'parallel'} onChange={(e) => setReadingOrder(e.target.value)} className="h-4 w-4" /><label htmlFor="parallel" className="ml-3">新舊約同時進行</label></div>
            </div>
        </div>
        <div>
            <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {isLoading ? '儲存中...' : (existingPlan ? '更新計劃' : '生成計劃')}
            </button>
        </div>
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
      </form>
    </div>
  )
}
