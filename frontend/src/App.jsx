import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import CoursePage from './pages/CoursePage'

const SESSION_KEY = 'atv_webinar_user'

function readSession() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [user, setUser] = useState(() => readSession())

  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const handleLogin = (userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
    window.history.pushState({}, '', '/curso')
    setPath('/curso')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
    window.history.pushState({}, '', '/')
    setPath('/')
  }

  if (path === '/curso') {
    if (!user) {
      window.history.pushState({}, '', '/')
      return <LoginPage onLogin={handleLogin} />
    }
    return <CoursePage user={user} onLogout={handleLogout} />
  }

  return <LoginPage onLogin={handleLogin} />
}
