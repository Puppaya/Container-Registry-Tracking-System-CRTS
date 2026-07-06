import type { NavigationMenuItem } from '@nuxt/ui'
import {
  buildCommandPaletteGroups as buildCommandPaletteGroupsRaw,
  buildSidebarNav as buildSidebarNavRaw,
  getModuleDescription as getModuleDescriptionRaw
} from '~/utils/navigation'

export function useAppNavigation() {
  const { t } = useI18n()
  const { user } = useUserSession()

  const userRole = computed(() => (user.value as { role?: string })?.role || '')

  const navGroups = computed(() => buildSidebarNavRaw(t, userRole.value))
  const commandGroups = computed(() => {
    const moduleGroups = buildCommandPaletteGroupsRaw(t, userRole.value)
    const flatNav = navGroups.value.flat().filter(item => item.to)

    return [{
      id: 'links',
      label: t('nav.goTo'),
      items: flatNav as NavigationMenuItem[]
    }, ...moduleGroups]
  })

  function getModuleDescription(path: string) {
    return getModuleDescriptionRaw(path, t)
  }

  return {
    navGroups,
    commandGroups,
    getModuleDescription
  }
}
