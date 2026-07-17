import { lazy, Suspense, useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import IntroPage from './pages/IntroPage'

const CoursePage = lazy(() => import('./pages/CoursePage'))

const SESSION_KEY = 'atv_webinar_user'
const BASE = '/course'

function introPendingKey(code) {
  return `atv_intro_pending_${code}`
}

function introDoneKey(code) {
  return `atv_intro_done_${code}`
}

function stripBase(path) {
  const p = path.startsWith(BASE) ? path.slice(BASE.length) : path
  return p === '' ? '/' : p
}

function readSession() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

function shouldShowIntro(user) {
  if (!user?.access_code) return false
  if (localStorage.getItem(introDoneKey(user.access_code))) return false
  return localStorage.getItem(introPendingKey(user.access_code)) === '1'
}

function resolveInitialPath(user) {
  const current = stripBase(window.location.pathname)
  if (!user) return current === '/contenido' || current === '/intro' ? '/' : current
  if (shouldShowIntro(user)) return '/intro'
  if (current === '/intro') return '/contenido'
  return current === '/' ? '/contenido' : current
}

export default function App() {
  const [user, setUser] = useState(() => readSession())
  const [path, setPath] = useState(() => resolveInitialPath(readSession()))

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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)

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
    if (user?.access_code) {
      localStorage.setItem(introDoneKey(user.access_code), '1')
      localStorage.removeItem(introPendingKey(user.access_code))
    }
    goTo('/contenido')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
    goTo('/')
  }

  if (!user || path === '/') {
    return <LoginPage onLogin={handleLogin} />
  }

  if (path === '/intro' || shouldShowIntro(user)) {
    return <IntroPage user={user} onContinue={handleIntroContinue} />
  }

  return (
    <Suspense fallback={null}>
      <CoursePage user={user} onLogout={handleLogout} />
    </Suspense>
  )
}
