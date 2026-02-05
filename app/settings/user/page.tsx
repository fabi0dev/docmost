import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MainLayout } from '@/components/layout/main-layout'
import { UserSettingsPage } from '@/components/pages/user-settings-page'

export default async function UserSettingsRoute() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <MainLayout>
      <UserSettingsPage />
    </MainLayout>
  )
}
