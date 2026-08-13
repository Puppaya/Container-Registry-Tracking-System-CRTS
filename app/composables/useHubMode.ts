const SESSION_KEY = 'crts_hub_mode'

export function setHubMode(active: boolean): void {
  if (!import.meta.client) return
  if (active) {
    sessionStorage.setItem(SESSION_KEY, '1')
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

export function useHubMode() {
  const isHubMode = ref(false)

  onMounted(() => {
    isHubMode.value = sessionStorage.getItem(SESSION_KEY) === '1'
  })

  return { isHubMode: readonly(isHubMode) }
}
