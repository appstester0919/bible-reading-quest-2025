import { createClient } from '@/lib/supabase/server'
import { ALL_BOOKS } from '@/lib/bibleData'
import LeaderboardView from '@/components/LeaderboardView'

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

  if (plansError || progressError || profilesError) {
    return <p>無法載入排行榜資料。</p>;
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

  return (
    <div className="min-h-screen mobile-app-container">
      <div className="container-responsive py-4 md:py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">同行榜</h1>
          <p className="text-white/80 text-sm md:text-base">眾人一同奔跑，向著標竿直跑</p>
        </div>
        <div className="card-modern p-4 md:p-6 mb-16 max-w-4xl mx-auto">
          <LeaderboardView data={leaderboardData} />
        </div>
      </div>
    </div>
  );
}
