import { createClient } from '@/lib/supabase/server'
import { ALL_BOOKS } from '@/lib/bibleData'
import LeaderboardView from '@/components/LeaderboardView'
import { logger } from '@/lib/utils/logger'

// 禁用快取，確保資料即時更新
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper function to parse reading strings like "Genesis 1-3"
const getBookFromReading = (reading: string): string => {
  return reading.split(' ').slice(0, -1).join(' ');
}

interface LeaderboardEntry {
  username: string | null;
  avatar_url: string | null;
  completed_books_count: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // 1. Fetch all necessary data in parallel
  const [plansRes, progressRes, profilesRes] = await Promise.all([
    supabase.from('reading_plans').select('user_id, generated_plan'),
    supabase.from('progress').select('user_id, read_date'),
    supabase.from('profiles').select('id, username, avatar_url')
  ]);

  const { data: plans, error: plansError } = plansRes;
  const { data: allProgress, error: progressError } = progressRes;
  const { data: profiles, error: profilesError } = profilesRes;

  // 調試信息
  logger.log('排行榜調試信息：');
  logger.log('Plans count:', plans?.length || 0);
  logger.log('Progress count:', allProgress?.length || 0);
  logger.log('Profiles count:', profiles?.length || 0);
  logger.log('Plans error:', plansError);
  logger.log('Progress error:', progressError);
  logger.log('Profiles error:', profilesError);

  if (plansError || progressError || profilesError) {
    logger.error('排行榜錯誤：', { plansError, progressError, profilesError });
    return (
      <div className="min-h-screen mobile-app-container">
        <div className="container-responsive py-4 md:py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">同行榜</h1>
            <p className="text-white/80 text-sm md:text-base">載入中遇到問題</p>
          </div>
          <div className="card-modern p-4 md:p-6 mb-16 max-w-4xl mx-auto">
            <p className="text-center text-gray-600">
              無法載入排行榜資料。<br/>
              Plans: {plans?.length || 0} 筆<br/>
              Progress: {allProgress?.length || 0} 筆<br/>
              Profiles: {profiles?.length || 0} 筆
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Process data
  const progressByUser = new Map<string, Set<string>>();
  allProgress.forEach(p => {
    if (!progressByUser.has(p.user_id)) {
      progressByUser.set(p.user_id, new Set());
    }
    progressByUser.get(p.user_id)!.add(p.read_date);
  });

  const profilesById = new Map(profiles.map(p => [p.id, p]));

  const leaderboardData: LeaderboardEntry[] = plans.map(plan => {
    const userProgress = progressByUser.get(plan.user_id) || new Set();
    const userProfile = profilesById.get(plan.user_id);
    const generatedPlan = plan.generated_plan as { [date: string]: string[] };

    let completedBooksCount = 0;
    ALL_BOOKS.forEach(book => {
      const datesForBook: string[] = [];
      Object.entries(generatedPlan).forEach(([date, readings]) => {
        if (readings.some(r => getBookFromReading(r) === book.name)) {
          datesForBook.push(date);
        }
      });

      if (datesForBook.length > 0 && datesForBook.every(date => userProgress.has(date))) {
        completedBooksCount++;
      }
    });

    return {
      username: userProfile?.username || '匿名用戶',
      avatar_url: userProfile?.avatar_url || null,
      completed_books_count: completedBooksCount,
    };
  });

  // 3. Sort the leaderboard
  leaderboardData.sort((a, b) => b.completed_books_count - a.completed_books_count);

  // 更多調試信息
  logger.log('處理後的排行榜數據：');
  logger.log('Leaderboard entries:', leaderboardData.length);
  leaderboardData.forEach((entry, index) => {
    logger.log(`${index + 1}. ${entry.username}: ${entry.completed_books_count} 卷`);
  });

  return (
    <div className="min-h-screen mobile-app-container">
      <div className="container-responsive py-4 md:py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">同行榜</h1>
          <p className="text-white/80 text-sm md:text-base">眾人一同奔跑，向著標竿直跑</p>
        </div>
        <div className="card-modern p-4 md:p-6 mb-16 max-w-4xl mx-auto">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">暫無排行榜數據</h3>
              <p className="text-gray-500 mb-4">
                目前還沒有其他用戶創建讀經計劃。<br/>
                邀請朋友一起加入讀經之旅吧！
              </p>
              <div className="text-sm text-gray-400">
                <p>數據統計：</p>
                <p>讀經計劃: {plans?.length || 0} 個</p>
                <p>用戶檔案: {profiles?.length || 0} 個</p>
                <p>讀經記錄: {allProgress?.length || 0} 筆</p>
              </div>
            </div>
          ) : leaderboardData.length === 1 ? (
            <div>
              <div className="text-center py-4 mb-6 bg-blue-50 rounded-lg">
                <div className="text-4xl mb-2">🌟</div>
                <h3 className="text-lg font-semibold text-blue-700 mb-1">你是第一位！</h3>
                <p className="text-blue-600 text-sm">
                  邀請朋友一起加入，讓讀經之旅更有趣！
                </p>
              </div>
              <LeaderboardView data={leaderboardData} />
            </div>
          ) : (
            <LeaderboardView data={leaderboardData} />
          )}
        </div>
      </div>
    </div>
  );
}
