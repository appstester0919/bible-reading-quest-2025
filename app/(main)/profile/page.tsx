import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import { logger } from '@/lib/utils/logger'

// 禁用快取，確保資料即時更新
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    logger.error('Error fetching profile:', error)
  }

  return (
    <div className="min-h-screen mobile-app-container">
      <div className="container-responsive py-4 md:py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">個人資料與設定</h1>
        </div>
        <div className="card-modern p-4 md:p-6 mb-8 max-w-2xl mx-auto">
          <ProfileForm profile={profile || { username: '', avatar_url: '' }} />
        </div>
      </div>
    </div>
  )
}
