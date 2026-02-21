import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/dashboard'

export const metadata = {
  title: 'Admin Dashboard | Sadeepa Photography',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const [{ data: packages }, { data: images }, { data: bookings }] = await Promise.all([
    supabase.from('packages').select('*').order('sort_order'),
    supabase.from('gallery_images').select('*').order('sort_order'),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <AdminDashboard
      packages={packages ?? []}
      images={images ?? []}
      bookings={bookings ?? []}
      user={user}
    />
  )
}
