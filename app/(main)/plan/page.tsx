import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanForm from '@/components/PlanForm'

// Disable caching for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlanPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existingPlan } = await supabase
    .from('reading_plans')
    .select('start_date, chapters_per_day, reading_order')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="p-4 md:p-8">
      <PlanForm existingPlan={existingPlan} />
    </div>
  )
}