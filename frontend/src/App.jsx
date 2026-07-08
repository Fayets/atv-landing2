import { lazy, Suspense, useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'

const CoursePage = lazy(() => import('./pages/CoursePage'))

const SESSION_KEY = 'atv_webinar_user'
const BASE = '/curso'

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

export default function App() {
  const [path, setPath] = useState(() => stripBase(window.location.pathname))
  const [user, setUser] = useState(() => readSession())

  useEffect(() => {
    const sync = () => setPath(stripBase(window.location.pathname))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const handleLogin = (userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
    window.history.pushState({}, '', `${BASE}/curso`)
    setPath('/curso')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
    window.history.pushState({}, '', BASE)
    setPath('/')
  }

  if (path === '/curso') {
    if (!user) {
      window.history.pushState({}, '', BASE)
      return <LoginPage onLogin={handleLogin} />
    }
    return (
      <Suspense fallback={null}>
        <CoursePage user={user} onLogout={handleLogout} />
      </Suspense>
    )
  }

  return <LoginPage onLogin={handleLogin} />
}
