import Header from '@/components/header'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authenticate on the server
  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.getUser()
  if (authError || !data?.user) {
    redirect('/login')
  }

  return (
    <>
      <Header user={data.user} />
      <main className="min-h-screen bg-black text-white">
        {children}
      </main>
    </>
  )
}
