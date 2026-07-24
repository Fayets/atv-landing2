import { lazy, Suspense, useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import IntroPage from './pages/IntroPage'

const CoursePage = lazy(() => import('./pages/CoursePage'))

const SESSION_KEY = 'atv_webinar_user'
const BASE = '/course'
/** Clave de prueba: siempre muestra la intro al loguear. Sacar cuando ya no haga falta. */
const TEST_INTRO_CODE = 'ATV-INTRO'
const TEST_INTRO_SKIP_KEY = 'atv_test_intro_skipped'

function introPendingKey(code) {
  return `atv_intro_pending_${code}`
}

function introDoneKey(code) {
  return `atv_intro_done_${code}`
}

function isTestIntroCode(code) {
  return String(code || '').toUpperCase() === TEST_INTRO_CODE
}

function stripBase(path) {
  const p = path.startsWith(BASE) ? path.slice(BASE.length) : path
  return p === '' ? '/' : p
}

function initialPath() {
  const current = stripBase(window.location.pathname)
  if (current === '/contenido' || current === '/intro') return '/'
  return current
}

function shouldShowIntro(user) {
  if (!user?.access_code) return false

  if (isTestIntroCode(user.access_code)) {
    return sessionStorage.getItem(TEST_INTRO_SKIP_KEY) !== '1'
  }

  if (localStorage.getItem(introDoneKey(user.access_code))) return false
  return localStorage.getItem(introPendingKey(user.access_code)) === '1'
}

export default function App() {
  const [user, setUser] = useState(null)
  const [path, setPath] = useState(initialPath)

  useEffect(() => {
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  useEffect(() => {
    const sync = () => setPath(stripBase(window.location.pathname))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  // Mantener URL alineada con el path interno
  useEffect(() => {
    const full = path === '/' ? BASE : `${BASE}${path}`
    if (window.location.pathname !== full && window.location.pathname !== `${full}/`) {
      window.history.replaceState({}, '', full.endsWith('/') && path !== '/' ? full.slice(0, -1) : full)
    }
  }, [path])

  const goTo = (internalPath) => {
    const full = internalPath === '/' ? BASE : `${BASE}${internalPath}`
    window.history.pushState({}, '', full)
    setPath(internalPath)
  }

  const handleLogin = (userData) => {
    setUser(userData)

    if (isTestIntroCode(userData.access_code)) {
      sessionStorage.removeItem(TEST_INTRO_SKIP_KEY)
      goTo('/intro')
      return
    }

    if (userData.is_first_login && userData.access_code) {
      localStorage.setItem(introPendingKey(userData.access_code), '1')
      localStorage.removeItem(introDoneKey(userData.access_code))
      goTo('/intro')
      return
    }

    if (shouldShowIntro(userData)) {
      goTo('/intro')
      return
    }

    goTo('/contenido')
  }

  const handleIntroContinue = () => {
    if (isTestIntroCode(user?.access_code)) {
      sessionStorage.setItem(TEST_INTRO_SKIP_KEY, '1')
      goTo('/contenido')
      return
    }

    if (user?.access_code) {
      localStorage.setItem(introDoneKey(user.access_code), '1')
      localStorage.removeItem(introPendingKey(user.access_code))
    }
    goTo('/contenido')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TEST_INTRO_SKIP_KEY)
    setUser(null)
    goTo('/')
  }

  if (!user || path === '/') {
    return <LoginPage onLogin={handleLogin} />
  }

  if (path === '/intro' || shouldShowIntro(user)) {
    return (
      <IntroPage
        user={user}
        onContinue={handleIntroContinue}
        allowSeekForward={isTestIntroCode(user?.access_code)}
      />
    )
  }

  return (
    <Suspense fallback={null}>
      <CoursePage user={user} onLogout={handleLogout} />
    </Suspense>
  )
}
