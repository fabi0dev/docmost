'use client'

import { PageHeader } from '@/components/layout/page-header'
import { ThemePicker, type ThemeValue } from '@/components/layout/theme-picker'
import { SettingsSectionCard } from '@/components/ui/settings-section-card'
import { useUIStore } from '@/stores/ui-store'
import { Palette } from '@phosphor-icons/react'

export function PreferencesPage() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const handleThemeChange = (value: ThemeValue) => {
    setTheme(value)
  }

  return (
    <div className="flex h-full flex-col w-full">
      <PageHeader
        title="Minhas preferências"
        description="Aparência e configurações pessoais"
        showBackButton
      />

      <div className="flex-1 overflow-y-auto flex justify-center mx-auto">
        <div className="w-full max-w-3xl px-6 py-8 md:px-8 animate-fade-in-up">
          <SettingsSectionCard title="Aparência" icon={<Palette size={22} />}>
            <ThemePicker value={theme} onChange={handleThemeChange} />
          </SettingsSectionCard>
        </div>
      </div>
    </div>
  )
}
