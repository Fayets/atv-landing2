import { useState } from 'react'
import styles from './CoursePage.module.css'

const MODULES = [
  {
    id: 'marketing',
    title: 'MARKETING',
    lessons: [
      {
        title: 'Introducción al sistema',
        url: '#',
        description: 'En esta clase vas a entender el marco completo del sistema y cómo cada pieza se conecta con las demás. Es el punto de partida para todo lo que viene.',
      },
      {
        title: 'Cómo atraer leads calificados',
        url: '#',
        description: 'Vas a ver exactamente qué tipo de contenido y canales generan los leads con mayor intención de compra, y cómo filtrarlos desde el primer contacto.',
      },
      {
        title: 'Contenido que convierte',
        url: '#',
        description: 'El contenido que vende no es el que tiene más likes. Acá vas a aprender la estructura que convierte audiencia fría en conversaciones de venta.',
      },
    ],
    resources: [],
  },
  {
    id: 'ventas',
    title: 'VENTAS',
    lessons: [
      {
        title: 'La estructura de la llamada',
        url: '#',
        description: 'La diferencia entre cerrar y no cerrar está en los primeros 3 minutos. Vas a ver la estructura exacta que usan los closers con mayor tasa de cierre.',
      },
      {
        title: 'Manejo de objeciones',
        url: '#',
        description: 'Las objeciones no son un problema — son una señal de interés. En esta clase vas a aprender a convertir cada objeción en un paso más hacia el cierre.',
      },
    ],
    resources: [
      { title: 'Script de cierre PDF', url: '#' },
      { title: 'Checklist pre-llamada', url: '#' },
    ],
  },
  {
    id: 'sistemas',
    title: 'SISTEMAS',
    lessons: [
      {
        title: 'Automatizaciones clave',
        url: '#',
        description: 'Vas a ver qué procesos podés automatizar hoy mismo para liberar tiempo sin perder calidad de seguimiento ni conversión.',
      },
      {
        title: 'CRM y seguimiento',
        url: '#',
        description: 'Un lead que no se sigue es un lead perdido. Acá vas a armar el sistema de seguimiento que hace que ninguna oportunidad se enfríe sola.',
      },
    ],
    resources: [],
  },
]

export default function CoursePage({ user, onLogout }) {
  const [selected, setSelected] = useState({ moduleId: 'marketing', lessonIndex: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeModule = MODULES.find(m => m.id === selected.moduleId)
  const activeLesson = activeModule?.lessons[selected.lessonIndex]
  const lessonNumber = MODULES
    .slice(0, MODULES.indexOf(activeModule))
    .reduce((acc, m) => acc + m.lessons.length, 0) + selected.lessonIndex + 1

  const getEmbedUrl = (url) => {
    if (!url || url === '#') return null
    // Vimeo
    const vimeo = url.match(/vimeo\.com\/(\d+)/)
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?h=0&autoplay=0`
    // YouTube
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    // Loom
    const loom = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
    if (loom) return `https://www.loom.com/embed/${loom[1]}`
    return url
  }

  const embedUrl = getEmbedUrl(activeLesson?.url)

  return (
    <div className={styles.shell}>

      {/* NAVBAR */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>ATV</span>
        <span className={styles.navTitle}>ENTRENAMIENTO EXCLUSIVO</span>
        <div className={styles.navRight}>
          <span className={styles.navUser}>
            {user?.name?.split(' ')[0]}
            <span className={styles.navCode}>{user?.access_code}</span>
          </span>
          <button className={styles.navMenu} onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <button className={styles.navLogout} onClick={onLogout}>SALIR</button>
        </div>
      </nav>

      <div className={styles.body}>

        {/* SIDEBAR OVERLAY MOBILE */}
        {sidebarOpen && (
          <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)}>✕</button>
            <p className={styles.sidebarLabel}>CONTENIDO</p>
          </div>
          <nav className={styles.sidebarNav}>
            {MODULES.map(mod => (
              <div key={mod.id} className={styles.sidebarSection}>
                <p className={styles.sidebarSectionTitle}>{mod.title}</p>
                <ul className={styles.sidebarList}>
                  {mod.lessons.map((lesson, i) => {
                    const isActive = selected.moduleId === mod.id && selected.lessonIndex === i
                    const globalNum = MODULES
                      .slice(0, MODULES.indexOf(mod))
                      .reduce((acc, m) => acc + m.lessons.length, 0) + i + 1
                    return (
                      <li key={i}>
                        <button
                          className={`${styles.sidebarLesson} ${isActive ? styles.sidebarLessonActive : ''}`}
                          onClick={() => {
                            setSelected({ moduleId: mod.id, lessonIndex: i })
                            setSidebarOpen(false)
                          }}
                        >
                          <span className={styles.sidebarNum}>{String(globalNum).padStart(2, '0')}</span>
                          <span className={styles.sidebarLessonTitle}>{lesson.title}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <div className={styles.halo} aria-hidden="true" />

          <div className={styles.viewer}>

            {/* VIDEO */}
            <div className={styles.mediaWrap}>
              <div className={styles.media}>
                {embedUrl ? (
                  <div className={styles.embedWrap}>
                    <iframe
                      src={embedUrl}
                      className={styles.embed}
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <span className={styles.placeholderText}>PRÓXIMAMENTE</span>
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <div className={styles.info}>
              <p className={styles.infoSection}>{activeModule?.title}</p>
              <h1 className={styles.infoTitle}>
                <span className={styles.infoNum}>{String(lessonNumber).padStart(2, '0')}.</span>
                {activeLesson?.title}
              </h1>
            </div>

            {activeLesson?.description && (
              <div className={styles.description}>
                <p className={styles.descText}>{activeLesson.description}</p>
              </div>
            )}

            {/* RECURSOS */}
            {activeModule?.resources.length > 0 && (
              <div className={styles.resources}>
                <p className={styles.resourcesLabel}>RECURSOS</p>
                <ul className={styles.resourcesList}>
                  {activeModule.resources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.resourceLink}
                      >
                        <span className={styles.resourceIcon}>↓</span>
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </main>
      </div>

      <a
        href={`https://wa.me/5491162626702?text=${encodeURIComponent(
          `Hola Juan, estuve viendo el módulo de ${activeModule?.title} — "${activeLesson?.title}" y me surgió una duda.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.waBtn}
      >
        <span className={styles.waIcon}>💬</span>
        Consultar por WhatsApp
      </a>
    </div>
  )
}
