import { useMemo, useState } from 'react'
import styles from './DashboardPage.module.css'

const MOCK_LEADS = [
  { id: 1, name: 'Marcos Rodríguez', email: 'marcos@email.com', phone: '+54 9 11 1234-5678', situation: 'Tengo clientes pero quiero escalar', revenue: 'Entre $1.000 y $5.000/mes', obstacle: 'No tengo sistema para escalar', niche: 'Coaching / mentoría', created_at: '2026-06-18T14:32:00', contacted: false, notes: '' },
  { id: 2, name: 'Sofía Vargas', email: 'sofi.v@gmail.com', phone: '+54 9 11 9876-5432', situation: 'Tengo contenido pero no monetizo', revenue: 'Menos de $1.000/mes', obstacle: 'No tengo una oferta clara', niche: 'Marketing / growth', created_at: '2026-06-18T11:15:00', contacted: true, notes: 'Llamé el 18/06, muy interesada. Re-contactar el lunes.' },
  { id: 3, name: 'Lucía Pérez', email: 'luciaperez@outlook.com', phone: '+54 9 351 555-1234', situation: 'Arranco desde cero', revenue: 'Aún no factura nada', obstacle: 'No sé cómo conseguir clientes', niche: 'Fitness / salud', created_at: '2026-06-17T09:00:00', contacted: false, notes: '' },
  { id: 4, name: 'Andrés Giménez', email: 'andres.g@negocio.com', phone: '+54 9 11 4444-3333', situation: 'Tengo agencia/consultoría y quiero crecer', revenue: 'Más de $5.000/mes', obstacle: 'Mis precios son bajos', niche: 'Otro nicho de consultoría', created_at: '2026-06-17T16:45:00', contacted: true, notes: '' },
  { id: 5, name: 'Valentina Cruz', email: 'valen.cruz@mail.com', phone: '+54 9 261 777-8888', situation: 'Tengo contenido pero no monetizo', revenue: 'Menos de $1.000/mes', obstacle: 'No tengo una oferta clara', niche: 'Coaching / mentoría', created_at: '2026-06-16T08:30:00', contacted: false, notes: '' },
]

function phoneToWa(phone) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

function formatDateShort(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

function formatDateFull(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function countByField(leads, field) {
  const counts = {}
  for (const lead of leads) {
    const key = lead[field] || 'Sin dato'
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

function last14Days(leads) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    days.push({ key, label: formatDateShort(date.toISOString()), count: 0 })
  }

  for (const lead of leads) {
    const key = lead.created_at.slice(0, 10)
    const bucket = days.find((d) => d.key === key)
    if (bucket) bucket.count += 1
  }

  return days
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportEmails(leads) {
  const emails = leads.map((l) => l.email).join('\n')
  downloadFile('atv-leads-emails.txt', emails, 'text/plain;charset=utf-8')
}

function exportCsv(leads) {
  const headers = ['id', 'name', 'email', 'phone', 'situation', 'revenue', 'obstacle', 'niche', 'created_at', 'contacted', 'notes']
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = leads.map((l) => headers.map((h) => escape(l[h])).join(','))
  downloadFile('atv-leads.csv', [headers.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8')
}

function StatusPill({ contacted, onClick, fullWidth = false }) {
  return (
    <button
      type="button"
      className={`${styles.statusPill} ${contacted ? styles.statusContacted : styles.statusPending} ${fullWidth ? styles.statusFull : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <i className={`ti ${contacted ? 'ti-check' : 'ti-clock'}`} />
      {contacted ? 'Contactado' : 'Pendiente'}
    </button>
  )
}

function HorizontalBar({ label, value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className={styles.hBarRow}>
      <span className={styles.hBarLabel} title={label}>{label}</span>
      <div className={styles.hBarTrack}>
        <div className={styles.hBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.hBarValue}>{value}</span>
    </div>
  )
}

export default function DashboardPage() {
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')
  const niches = useMemo(() => [...new Set(leads.map((l) => l.niche))].sort(), [leads])

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (nicheFilter && lead.niche !== nicheFilter) return false
      if (statusFilter === 'pending' && lead.contacted) return false
      if (statusFilter === 'contacted' && !lead.contacted) return false
      if (!q) return true
      return (
        lead.name.toLowerCase().includes(q)
        || lead.email.toLowerCase().includes(q)
        || lead.phone.toLowerCase().includes(q)
      )
    })
  }, [leads, search, nicheFilter, statusFilter])

  const metrics = useMemo(() => {
    const total = leads.length
    const contacted = leads.filter((l) => l.contacted).length
    const pending = total - contacted
    const rate = total > 0 ? Math.round((contacted / total) * 100) : 0
    return { total, pending, contacted, rate }
  }, [leads])

  const dailyData = useMemo(() => last14Days(leads), [leads])
  const maxDaily = useMemo(() => Math.max(...dailyData.map((d) => d.count), 1), [dailyData])
  const nicheData = useMemo(() => countByField(leads, 'niche'), [leads])
  const situationData = useMemo(() => countByField(leads, 'situation'), [leads])
  const maxNiche = nicheData[0]?.[1] ?? 1
  const maxSituation = situationData[0]?.[1] ?? 1

  const selectedLead = leads.find((l) => l.id === selectedId) ?? null

  const toggleContacted = (id) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, contacted: !l.contacted } : l)))
  }

  const openPanel = (lead) => {
    setSelectedId(lead.id)
    setNoteDraft(lead.notes || '')
  }

  const closePanel = () => setSelectedId(null)

  const saveNote = () => {
    if (!selectedLead) return
    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: noteDraft } : l)))
  }

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <img
            src="/ATVLogin.png"
            alt="ATV — Aumenta Tu Valor"
            className={styles.logo}
            width={32}
            height={32}
          />
        </div>
      </nav>

      <main className={styles.content}>
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHead}>
              <span className={styles.metricLabel}>Leads totales</span>
              <i className="ti ti-users" />
            </div>
            <div className={styles.metricNum}>{metrics.total}</div>
          </div>
          <div className={`${styles.metricCard} ${styles.metricHighlight}`}>
            <div className={styles.metricHead}>
              <span className={styles.metricLabel}>Pendientes</span>
              <i className="ti ti-clock" />
            </div>
            <div className={`${styles.metricNum} ${styles.metricNumRed}`}>{metrics.pending}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricHead}>
              <span className={styles.metricLabel}>Contactados</span>
              <i className="ti ti-check" />
            </div>
            <div className={styles.metricNum}>{metrics.contacted}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricHead}>
              <span className={styles.metricLabel}>Tasa de contacto</span>
              <i className="ti ti-chart-pie" />
            </div>
            <div className={styles.metricNum}>{metrics.rate}%</div>
          </div>
        </section>

        <section className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Leads últimos 14 días</h2>
            <div className={styles.barChart}>
              {dailyData.map((day) => (
                <div key={day.key} className={styles.barCol}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        height: day.count > 0
                          ? `${Math.max((day.count / maxDaily) * 100, 2)}%`
                          : '0',
                        minHeight: day.count > 0 ? 2 : 0,
                      }}
                    />
                  </div>
                  <span className={styles.barLabel}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Por nicho</h2>
            <div className={styles.hBarList}>
              {nicheData.map(([label, value]) => (
                <HorizontalBar key={label} label={label} value={value} max={maxNiche} />
              ))}
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Por situación</h2>
            <div className={styles.hBarList}>
              {situationData.map(([label, value]) => (
                <HorizontalBar key={label} label={label} value={value} max={maxSituation} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <label className={styles.searchWrap}>
              <i className="ti ti-search" />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select className={styles.select} value={nicheFilter} onChange={(e) => setNicheFilter(e.target.value)}>
              <option value="">Todos los nichos</option>
              {niches.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="contacted">Contactados</option>
            </select>
          </div>
          <div className={styles.toolbarRight}>
            <span className={styles.leadCount}>{filteredLeads.length} leads</span>
            <button type="button" className={styles.btnExportEmails} onClick={() => exportEmails(filteredLeads)}>
              <i className="ti ti-mail" />
              Exportar emails
            </button>
            <button type="button" className={styles.btnExportCsv} onClick={() => exportCsv(filteredLeads)}>
              <i className="ti ti-download" />
              CSV completo
            </button>
          </div>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Nicho</th>
                  <th>Situación</th>
                  <th>Facturación</th>
                  <th>Obstáculo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} onClick={() => openPanel(lead)}>
                    <td className={styles.cellMuted}>{lead.id}</td>
                    <td className={styles.cellName}>{lead.name}</td>
                    <td className={styles.cellMuted}>{lead.email}</td>
                    <td>
                      <a
                        href={phoneToWa(lead.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.waLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="ti ti-brand-whatsapp" />
                        {lead.phone}
                      </a>
                    </td>
                    <td><span className={styles.nicheBadge}>{lead.niche}</span></td>
                    <td className={styles.cellMuted}>{lead.situation}</td>
                    <td className={styles.cellMuted}>{lead.revenue}</td>
                    <td className={styles.cellMuted}>{lead.obstacle}</td>
                    <td className={styles.cellMuted}>{formatDateShort(lead.created_at)}</td>
                    <td>
                      <StatusPill contacted={lead.contacted} onClick={() => toggleContacted(lead.id)} />
                    </td>
                    <td>
                      <button type="button" className={styles.rowAction} onClick={(e) => { e.stopPropagation(); openPanel(lead) }}>
                        <i className="ti ti-chevron-right" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {selectedLead && (
        <>
          <button type="button" className={styles.overlay} aria-label="Cerrar panel" onClick={closePanel} />
          <aside className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelName}>{selectedLead.name}</h2>
                <p className={styles.panelDate}>{formatDateFull(selectedLead.created_at)}</p>
              </div>
              <button type="button" className={styles.panelClose} onClick={closePanel}>
                <i className="ti ti-x" />
              </button>
            </header>

            <section className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Contacto</h3>
              <a href={`mailto:${selectedLead.email}`} className={styles.panelLink}>
                <i className="ti ti-mail" />
                {selectedLead.email}
              </a>
              <a href={phoneToWa(selectedLead.phone)} target="_blank" rel="noopener noreferrer" className={styles.panelWa}>
                <i className="ti ti-brand-whatsapp" />
                {selectedLead.phone}
              </a>
            </section>

            <section className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Respuestas del quiz</h3>
              {[
                ['Situación', selectedLead.situation],
                ['Facturación', selectedLead.revenue],
                ['Obstáculo', selectedLead.obstacle],
                ['Nicho', selectedLead.niche],
              ].map(([label, value]) => (
                <div key={label} className={styles.quizField}>
                  <span className={styles.quizLabel}>{label}</span>
                  <div className={styles.quizValue}>{value}</div>
                </div>
              ))}
            </section>

            <section className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Estado</h3>
              <StatusPill
                contacted={selectedLead.contacted}
                onClick={() => toggleContacted(selectedLead.id)}
                fullWidth
              />
            </section>

            <section className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Notas internas</h3>
              <textarea
                className={styles.notesArea}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Agregar notas sobre este lead..."
                rows={4}
              />
              <button type="button" className={styles.btnSaveNote} onClick={saveNote}>
                Guardar nota
              </button>
            </section>
          </aside>
        </>
      )}
    </div>
  )
}
