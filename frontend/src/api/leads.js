const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function loginWithCode(code) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_code: code }),
  })
  if (!res.ok) throw new Error('Clave inválida')
  return res.json()
}
