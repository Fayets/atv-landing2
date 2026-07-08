const STORAGE_KEY = 'atv_theme'

export function getTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* ignore */ }
  return 'dark'
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch { /* ignore */ }
}

export function toggleTheme() {
  const next = getTheme() === 'light' ? 'dark' : 'light'
  applyTheme(next)
  return next
}

export function initTheme() {
  applyTheme(getTheme())
}
