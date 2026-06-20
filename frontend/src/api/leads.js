const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function submitLead(data) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('No se pudo enviar el lead')
  return res.json()
}

export async function fetchLeads() {
  const res = await fetch(`${API_BASE}/leads`)
  if (!res.ok) throw new Error('No se pudieron cargar los leads')
  return res.json()
}

export async function updateLead(id, data) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('No se pudo actualizar el lead')
  return res.json()
}
