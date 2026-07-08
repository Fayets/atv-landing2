import { useState } from 'react'
import { getTheme, toggleTheme } from '../utils/theme'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getTheme)

  function handleToggle() {
    setTheme(toggleTheme())
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`.trim()}
      onClick={handleToggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.5" />
          <path
            d="M12 2v2.5M12 19.5v2.5M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  )
}
