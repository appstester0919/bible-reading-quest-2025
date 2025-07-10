import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ALL_BOOKS } from '@/lib/bibleData'
import MapView from '@/components/MapView'

// Helper function to parse reading strings like "Genesis 1-3" or "John 3"
const getBookFromReading = (reading: string): string => {
  return reading.split(' ').slice(0, -1).join(' ');
}

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <p>請登入以查看您的地圖。</p>
  }

  // Fetch plan and progress data
  const { data: planData } = await supabase.from('reading_plans').select('generated_plan').eq('user_id', user.id).single()
  const { data: progressData } = await supabase.from('progress').select('read_date').eq('user_id', user.id)

  if (!planData) {
    return (
      <div className="min-h-screen flex items-center justify-center mobile-padding">
        <div className="card-modern p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">🗺️</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">尚未建立讀經計劃</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">您需要先建立一個讀經計劃才能查看您的地圖進度。</p>
          <Link href="/plan" className="btn-primary inline-block">立即制定計劃</Link>
        </div>
      </div>
    )
  }

  const plan = planData.generated_plan as { [date: string]: string[] }
  const completedDates = new Set(progressData?.map(p => p.read_date) || [])

  // --- Logic to calculate completed books ---
  const completedBooks: string[] = []
  ALL_BOOKS.forEach(book => {
    const datesForBook: string[] = []
    Object.entries(plan).forEach(([date, readings]) => {
      if (readings.some(r => getBookFromReading(r) === book.name)) {
        datesForBook.push(date)
      }
    })

    if (datesForBook.length > 0 && datesForBook.every(date => completedDates.has(date))) {
      completedBooks.push(book.name)
    }
  })
  // --- End of logic ---

  const showEncouragement = completedBooks.length > 0 && completedBooks.length % 3 === 0;
  const showFireworks = completedBooks.length === ALL_BOOKS.length;

  return (
    <div className="min-h-screen mobile-app-container">
      <div className="container-responsive py-4 md:py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">我的拼圖地圖</h1>
          <p className="text-white/80 text-sm md:text-base">每完成一卷書，就會點亮一塊地圖。已完成 {completedBooks.length} / {ALL_BOOKS.length} 卷。</p>
        </div>
        <div className="card-modern p-4 md:p-6 mb-16 max-w-6xl mx-auto">
          <MapView completedBooks={completedBooks} showEncouragement={showEncouragement} showFireworks={showFireworks} />
        </div>
      </div>
    </div>
  )
}
