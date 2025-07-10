'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import OfflineCalendarView from '@/components/OfflineCalendarView'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUser(user);

      const { data: planData } = await supabase
        .from('reading_plans')
        .select('generated_plan')
        .eq('user_id', user.id)
        .single();

      if (planData) {
        setPlan(planData.generated_plan);
        const { data: progressData } = await supabase
          .from('progress')
          .select('read_date')
          .eq('user_id', user.id);
        
        setProgress(new Set(progressData?.map(p => p.read_date) || []));
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (isLoading) {
    return <p className="p-8">載入中...</p>;
  }

  if (!user) {
    return <p className="p-8">請登入以查看您的儀表板。</p>;
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center mobile-padding">
        <div className="card-modern p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">📖</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">尚未建立讀經計劃</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">您需要先建立一個讀經計劃才能看到您的日曆。讓我們開始您的靈修之旅吧！</p>
          <Link href="/plan" className="btn-primary inline-block">
            立即制定計劃
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mobile-app-container">
      <div className="container-responsive py-4 md:py-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">我的讀經日曆</h1>
          <p className="text-white/80 text-sm md:text-base">點擊日期標記讀經進度</p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatsCard 
            title="本月已讀"
            value={getCurrentMonthProgress(progress)}
            icon="📚"
            color="bg-green-500"
          />
          <StatsCard 
            title="總進度"
            value={`${progress.size}天`}
            icon="🎯"
            color="bg-blue-500"
          />
          <StatsCard 
            title="連續天數"
            value={getStreakDays(progress)}
            icon="🔥"
            color="bg-orange-500"
          />
        </div>

        {/* Calendar Section */}
        <div className="card-modern p-4 md:p-8 mb-16 max-w-5xl mx-auto">
          <OfflineCalendarView 
            plan={plan}
            progress={progress}
            setProgress={setProgress}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: { 
  title: string; 
  value: string; 
  icon: string; 
  color: string; 
}) {
  return (
    <div className="card-modern p-4 text-center">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-2`}>
        <span className="text-white text-lg md:text-xl">{icon}</span>
      </div>
      <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1 leading-tight">{title}</h3>
      <p className="text-lg md:text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function getCurrentMonthProgress(progress: Set<string>): string {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthProgress = Array.from(progress).filter(dateString => {
    const date = new Date(dateString);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  return `${monthProgress.length}天`;
}

function getStreakDays(progress: Set<string>): string {
  const sortedDates = Array.from(progress)
    .map(dateString => new Date(dateString))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (sortedDates.length === 0) return "0天";
  
  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if the most recent date is today or yesterday
  const mostRecent = sortedDates[0];
  mostRecent.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1) return "0天";
  
  for (let i = 1; i < sortedDates.length; i++) {
    const current = sortedDates[i];
    const previous = sortedDates[i - 1];
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return `${streak}天`;
}
