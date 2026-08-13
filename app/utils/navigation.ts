import type { NavigationMenuItem } from '@nuxt/ui'

export type NavRole = 'Administrator' | 'RegistryOfficer' | 'SurveyTeam' | 'Management'

interface NavLink extends NavigationMenuItem {
  roles?: NavRole[]
  labelKey: string
}

interface NavGroup {
  id: string
  labelKey: string
  items: NavLink[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    labelKey: 'nav.groups.overview',
    items: [{
      labelKey: 'nav.items.dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard'
    }]
  },
  {
    id: 'registry',
    labelKey: 'nav.groups.registry',
    items: [{
      labelKey: 'nav.items.registryList',
      icon: 'i-lucide-container',
      to: '/containers'
    }, {
      labelKey: 'nav.items.registerContainer',
      icon: 'i-lucide-file-plus',
      to: '/containers/register',
      roles: ['Administrator', 'RegistryOfficer']
    }]
  },
  {
    id: 'operations',
    labelKey: 'nav.groups.operations',
    items: [{
      labelKey: 'nav.items.lifecycleTracking',
      icon: 'i-lucide-history',
      to: '/containers/lifecycle'
    }, {
      labelKey: 'nav.items.movementLog',
      icon: 'i-lucide-truck',
      to: '/containers/movements'
    }, {
      labelKey: 'nav.items.surveyInspections',
      icon: 'i-lucide-clipboard-list',
      to: '/survey/inspections'
    }]
  },
  {
    id: 'search',
    labelKey: 'nav.groups.search',
    items: [{
      labelKey: 'nav.items.advancedSearch',
      icon: 'i-lucide-sliders-horizontal',
      to: '/containers/search'
    }, {
      labelKey: 'nav.items.qrScan',
      icon: 'i-lucide-qr-code',
      to: '/containers/scan'
    }]
  },
  {
    id: 'reporting',
    labelKey: 'nav.groups.reporting',
    items: [{
      labelKey: 'nav.items.analytics',
      icon: 'i-lucide-chart-pie',
      to: '/analytics',
      roles: ['Administrator', 'Management']
    }, {
      labelKey: 'nav.items.reports',
      icon: 'i-lucide-file-bar-chart',
      to: '/analytics/reports',
      roles: ['Administrator', 'Management']
    }]
  },
  {
    id: 'admin',
    labelKey: 'nav.groups.admin',
    items: [{
      labelKey: 'nav.items.users',
      icon: 'i-lucide-users',
      to: '/users',
      roles: ['Administrator']
    }, {
      labelKey: 'nav.items.masterData',
      icon: 'i-lucide-database',
      to: '/master-data/iso-type',
      roles: ['Administrator']
    }, {
      labelKey: 'nav.items.auditLogs',
      icon: 'i-lucide-shield-check',
      to: '/audit-logs',
      roles: ['Administrator']
    }]
  }
]

const MODULE_DESCRIPTION_KEYS: Record<string, { titleKey: string, descriptionKey: string }> = {
  '/dashboard': {
    titleKey: 'nav.modules.dashboard.title',
    descriptionKey: 'nav.modules.dashboard.description'
  },
  '/containers': {
    titleKey: 'nav.modules.containers.title',
    descriptionKey: 'nav.modules.containers.description'
  },
  '/containers/register': {
    titleKey: 'nav.modules.register.title',
    descriptionKey: 'nav.modules.register.description'
  },
  '/containers/lifecycle': {
    titleKey: 'nav.modules.lifecycle.title',
    descriptionKey: 'nav.modules.lifecycle.description'
  },
  '/containers/movements': {
    titleKey: 'nav.modules.movements.title',
    descriptionKey: 'nav.modules.movements.description'
  },
  '/survey/inspections': {
    titleKey: 'nav.modules.survey.title',
    descriptionKey: 'nav.modules.survey.description'
  },
  '/containers/search': {
    titleKey: 'nav.modules.search.title',
    descriptionKey: 'nav.modules.search.description'
  },
  '/containers/scan': {
    titleKey: 'nav.modules.scan.title',
    descriptionKey: 'nav.modules.scan.description'
  },
  '/analytics': {
    titleKey: 'nav.modules.analytics.title',
    descriptionKey: 'nav.modules.analytics.description'
  },
  '/analytics/reports': {
    titleKey: 'nav.modules.reports.title',
    descriptionKey: 'nav.modules.reports.description'
  },
  '/master-data': {
    titleKey: 'nav.modules.masterData.title',
    descriptionKey: 'nav.modules.masterData.description'
  }
}

function canAccessLink(link: NavLink, role: string): boolean {
  if (!link.roles?.length) return true
  return link.roles.includes(role as NavRole)
}

export function buildSidebarNav(
  t: (key: string) => string,
  role: string = ''
): NavigationMenuItem[][] {
  const groups: NavigationMenuItem[][] = []

  for (const group of NAV_GROUPS) {
    const items = group.items
      .filter(link => canAccessLink(link, role))
      .map(({ labelKey, roles: _roles, ...link }) => ({
        ...link,
        label: t(labelKey)
      }) as NavigationMenuItem)

    if (!items.length) continue

    groups.push([
      { type: 'label', label: t(group.labelKey) },
      ...items
    ])
  }

  return groups
}

export function buildCommandPaletteGroups(t: (key: string) => string, role: string = '') {
  const flatItems = NAV_GROUPS.flatMap(g =>
    g.items
      .filter(link => canAccessLink(link, role))
      .map(({ labelKey, roles: _roles, ...link }) => ({
        ...link,
        label: t(labelKey)
      }) as NavigationMenuItem)
  )

  return [{
    id: 'modules',
    label: t('nav.modulesLabel'),
    items: flatItems
  }]
}

export function getModuleDescription(
  path: string,
  t: (key: string) => string
): { title: string, description: string } | undefined {
  const keys = MODULE_DESCRIPTION_KEYS[path]
  if (!keys) return undefined

  return {
    title: t(keys.titleKey),
    description: t(keys.descriptionKey)
  }
}

/** @deprecated Use useAppNavigation() composable in Vue components */
export const MODULE_DESCRIPTIONS: Record<string, { title: string, description: string }> = {}
