// TODO deploy: agregar https://landing.atvos.io a CORS_ORIGINS
// en el .env del backend de ATV Ecosystem.

const ECOSYSTEM_API = import.meta.env.VITE_ECOSYSTEM_API_URL

export async function loginRequest(username, password) {
  const res = await fetch(`${ECOSYSTEM_API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Credenciales inválidas')
  return res.json()
}

export async function getSession() {
  try {
    const res = await fetch(`${ECOSYSTEM_API}/api/auth/session`, {
      credentials: 'include',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function logoutRequest() {
  await fetch(`${ECOSYSTEM_API}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
