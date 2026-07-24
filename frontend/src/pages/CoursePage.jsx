import { useCallback, useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import styles from './CoursePage.module.css'

const posterCache = new Map()

function preloadPoster(url) {
  if (!url) return
  const img = new Image()
  img.decoding = 'async'
  img.src = url
}

function getInstantPoster(url) {
  if (!url || url === '#') return null

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`

  const fathom = url.match(/fathom\.video\/share\/([^/?]+)/)
  if (fathom) return `https://fathom.video/share/${fathom[1]}/thumbnail`

  return null
}

async function fetchPoster(url) {
  if (!url || url === '#') return null

  if (url.includes('loom.com/share/')) {
    try {
      const res = await fetch(
        `https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}`,
      )
      if (res.ok) {
        const data = await res.json()
        return data.thumbnail_url || null
      }
    } catch { /* ignore */ }
  }

  if (url.includes('vimeo.com/')) {
    try {
      const res = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      )
      if (res.ok) {
        const data = await res.json()
        return data.thumbnail_url || null
      }
    } catch { /* ignore */ }
  }

  return null
}

async function resolvePoster(url) {
  if (!url || url === '#') return null
  if (posterCache.has(url)) return posterCache.get(url)

  const instant = getInstantPoster(url)
  if (instant) {
    posterCache.set(url, instant)
    return instant
  }

  const fetched = await fetchPoster(url)
  if (fetched) posterCache.set(url, fetched)
  return fetched
}

function prefetchNearbyPosters(moduleId, lessonIndex) {
  const modIdx = MODULES.findIndex(m => m.id === moduleId)
  if (modIdx === -1) return

  const mod = MODULES[modIdx]
  const nearby = [
    mod.lessons[lessonIndex + 1]?.url,
    mod.lessons[lessonIndex - 1]?.url,
    MODULES[modIdx + 1]?.lessons[0]?.url,
  ].filter(u => u && u !== '#')

  nearby.forEach(url => {
    resolvePoster(url).then(p => p && preloadPoster(p))
  })
}

function getEmbedUrl(url) {
  if (!url || url === '#') return null

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    const tMatch = url.match(/[?&]t=(\d+)/)
    const start = tMatch ? tMatch[1] : null
    const base = `https://www.youtube.com/embed/${ytMatch[1]}`
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      ...(start ? { start } : {}),
    })
    return `${base}?${params}`
  }

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1&title=0&byline=0`

  const loom = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loom) return `https://www.loom.com/embed/${loom[1]}`

  const fathom = url.match(/fathom\.video\/share\/([^/?]+)/)
  if (fathom) return `https://fathom.video/embed/${fathom[1]}`

  return null
}

const WA_NUMBER = '5491162626702'
const CALENDLY_URL = 'https://calendly.com/aumentatuvalor/llamada-de-conocimeinto-atv'

const LESSON_CLOSING = [
  'si llegaste hasta acá, ya sabés qué hacer',
  'el tema es que saberlo no alcanza, sin criterio aplicado a tu negocio seguís adivinando 6 meses más',
  'trabajamos con más de 120 negocios llevándolas a $30k–$150k por mes con orgánico',
  'si querés que veamos tu caso, agendá acá',
]
const VSL_VIMEO_URL = 'https://vimeo.com/1210850489'

function vslLessonTitle(lesson, moduleTitle) {
  const label = lesson?.vslTitle ?? moduleTitle
  return `Agenda tu llamada de: ${label}`
}

const MODULES = [
  {
    id: 'bases',
    title: 'PRINCIPIOS BASICOS',
    lessons: [
      {
        title: 'Volumen, análisis y apalancamiento',
        url: 'https://vimeo.com/1160887683',
        resources: [
          { title: 'ACCIÓN > PENSAR', url: 'https://docs.google.com/document/d/1AW6NUMzlhnsTtu48KsV9ROWcCRb2CEA4ytwihfocNaQ/copy' },
          { title: 'SOP: DIAGNÓSTICO Y ACCIÓN – VOLUMEN, ANÁLISIS, APALANCAMIENTO', url: 'https://docs.google.com/document/d/1lzDY0t1nFmgatV0GXwMXCfcSqoRl8Pwq0xMK7yQFgyU/copy' },
        ],
      },
      {
        title: 'Dónde enfocarnos para escalar a $100k/mes',
        url: 'https://vimeo.com/1161065905',
        resources: [
          { title: 'SOP: DIAGNÓSTICO DE CAPAS DE NEGOCIO', url: 'https://docs.google.com/document/d/1dB_FFZUsJtv3b18RyiyHlUCKHye0Zf6AI7zJ6jSrFsA/copy' },
        ],
      },
      {
        title: 'Cómo gestionar tu energía para hacer $100k/mes',
        url: 'https://www.loom.com/share/668e0231c3764b6e8cced95ce39322a6',
        resources: [],
      },
      {
        title: 'Métricas y sistemas para tu negocio $100k/mes',
        cta: true,
        poster: `${import.meta.env.BASE_URL}cta/foto1.png`,
        resources: [],
      },
      { vsl: true, vslTitle: 'BASES DE NEGOCIOS', resources: [] },
    ],
    resources: [],
  },
  {
    id: 'marketing',
    title: 'MARKETING',
    lessons: [
      {
        title: 'Ecosistema de contenido',
        url: 'https://vimeo.com/1161067574',
        resources: [
          { title: 'ECOSYSTEM CONTENT', url: 'https://miro.com/app/board/uXjVGJOeQtA=/?share_link_id=886926435324' },
        ],
      },
      {
        title: 'Optimización de perfil',
        url: 'https://www.loom.com/share/d7e3937496a747ffbf9264f7aa82d014',
        resources: [
          { title: 'SOP ENTREGABLE: OPTIMIZACIÓN DE PERFIL', url: 'https://docs.google.com/document/d/1w8QVeY_uwJ52ddfW7XC7TuLAQF5ihoy3GzG4_nlbQzU/copy' },
        ],
      },
      {
        title: 'El detrás de mis secuencias de historias',
        url: 'https://www.youtube.com/watch?v=Rcx0O4yojsI&t=1327s',
        resources: [
          { title: 'SEQUENCE OF STORIES', url: 'https://docs.google.com/document/d/1qCMtYToU1ksAYGGEy9QuZTgrrMjUYaVN5J4qsVrE_xs/copy' },
        ],
      },
      {
        title: 'Cómo hacer tus secuencias de historias',
        url: 'https://vimeo.com/1161136006',
        resources: [
          { title: 'SECUENCIAS DE HISTORIAS', url: 'https://miro.com/app/board/uXjVGNV4Ejg=/?share_link_id=401015036323' },
        ],
      },
      {
        title: 'Cómo corregir un calendario de contenido para tu ICP',
        url: 'https://fathom.video/share/qsWHNxTWVTUpscRbD3Lrv1kXLsFKx4te',
        resources: [],
      },
      {
        title: 'Que contenido subir y como hacerlo (TOFU, MOFU y BOFU)',
        url: 'https://fathom.video/share/AYywrzjWxQunX3V3TtiPtbzAbx8iZXXM',
        resources: [],
      },
      {
        title: 'Cómo funciona un negocio $100k/mes con poca gente y mucho margen',
        url: 'https://www.youtube.com/watch?v=Ebum9B4BSSM&t=1314s',
        resources: [
          { title: 'EVERGREEN FUNNEL1', url: 'https://docs.google.com/document/d/1xGVKJDIo_AbpKTi4Fsyt1rmx7Znhi768TF6HycOETtA/copy' },
        ],
      },
      {
        title: 'Marketing y contenido $100k/mes',
        url: 'https://www.youtube.com/watch?v=-AnBdcU66OM&t=2106s',
        resources: [
          { title: 'MARKETING SYSTEM', url: 'https://docs.google.com/document/d/1Eq6jTcPrsP09gS3ByZE329MniH9Ai-PQafDclCFs1so/copy' },
        ],
      },
      {
        title: 'Cómo generar leads infinitos',
        cta: true,
        poster: `${import.meta.env.BASE_URL}cta/foto2.png`,
        resources: [],
      },
      { vsl: true, vslTitle: 'MARKETING/CONTENIDO', resources: [] },
    ],
    resources: [],
  },
  {
    id: 'ventas',
    title: 'VENTAS',
    lessons: [
      {
        title: 'Proceso de Ventas $100k/mes',
        url: 'https://www.youtube.com/watch?v=pF-93BMuR2Y&t=531s',
        resources: [],
      },
      {
        title: 'Reportes de Ventas a Marketing $100k/mes',
        url: 'https://fathom.video/share/Uv9jt7N-eyxQySYMDPmXxo-9zC8f7W59',
        resources: [
          { title: 'REPORTES VENTAS A MKT', url: 'https://miro.com/app/board/uXjVGJOeQtA=/?share_link_id=886926435324' },
        ],
      },
      {
        title: 'Cómo gestiono mi setter $100k/mes',
        url: 'https://fathom.video/share/mW1fUraKD3tC7sP4tTasy1f82DYBBfy5',
        resources: [],
      },
      {
        title: 'Cómo mejorar métricas de ventas haciendo menos contenido',
        url: 'https://fathom.video/share/-kwc6_k1Hy7m2Pm8WxHoKZsKZzNNyR69',
        resources: [],
      },
      {
        title: 'Servicio, upsells y carga operativa $100k/mes',
        url: 'https://www.youtube.com/watch?v=R1Cr7Xer-KE&t=1158s',
        resources: [
          { title: 'PRODUCT-SYSTEMS-TEAM', url: 'https://docs.google.com/document/d/1iYjbjzKIf-xC974pFqchy4JVRvb-EFArp8_CC8b-nJk/copy' },
        ],
      },
      {
        title: 'Cómo armar un proceso de ventas $100k/mes',
        cta: true,
        poster: `${import.meta.env.BASE_URL}cta/foto3.png`,
        resources: [],
      },
      { vsl: true, resources: [] },
    ],
    resources: [],
  },
  {
    id: 'equipo',
    title: 'EQUIPO',
    lessons: [
      {
        title: 'Mindset General del Equipo $100k/mes',
        url: 'https://www.youtube.com/watch?v=yhj5Qe_WrBI&t=8s',
        resources: [],
      },
      {
        title: 'Cómo hacer que tu equipo escale el negocio por vos',
        url: 'https://www.youtube.com/watch?v=zEv9ZD3MLrA&t=1723s',
        resources: [
          { title: '$100K TEAM', url: 'https://docs.google.com/document/d/1Reqr0JCIcl4nLdJeNZTfBlzQi00AwWSCvRj3rxt8Xg8/copy' },
        ],
      },
      {
        title: 'Cómo pagarle correctamente a tu equipo',
        url: 'https://www.youtube.com/watch?v=7eoNiBA861k&t=389s',
        resources: [],
      },
      {
        title: 'Cómo gestionar equipos como Growth',
        url: 'https://www.youtube.com/watch?v=y1bo6mBhehs&t=1171s',
        resources: [],
      },
      {
        title: 'Cómo atraer leads de calidanec',
        cta: true,
        poster: `${import.meta.env.BASE_URL}cta/foto4.png`,
        resources: [],
      },
      { vsl: true, vslTitle: 'GESTION DE EQUIPO', resources: [] },
    ],
    resources: [],
  },
  {
    id: 'ia-sistemas',
    title: 'IA Y SISTEMAS',
    lessons: [
      {
        title: 'Cómo usar Claude para mejorar el contenido',
        url: 'https://www.loom.com/share/8f524d28cb3f4a0bb8412fd8d85c302d',
        resources: [],
      },
      {
        title: 'Cómo usar Poppy',
        url: 'https://www.loom.com/share/e1d13ffe58d140aab6fbc62407eb0eab',
        resources: [],
      },
      {
        title: 'Poppy YouTube Template',
        url: 'https://www.loom.com/share/9bf50c9d0b1547c19600518a2c0876d7',
        resources: [],
      },
      {
        title: 'Poppy Stories',
        url: 'https://www.loom.com/share/5b75e4b5d35e4fcb99052694bf5a1928',
        resources: [],
      },
      {
        title: 'Poppy Reels',
        url: 'https://www.loom.com/share/1f23a048e9594230a7fa77dab083ddeb',
        resources: [],
      },
      { vsl: true, vslTitle: 'PRODUCTO/SISTEMAS/IA', resources: [] },
    ],
    resources: [],
  },
]

export default function CoursePage({ user, onLogout }) {
  const [selected, setSelected] = useState({ moduleId: 'bases', lessonIndex: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [poster, setPoster] = useState(null)

  const activeModule = MODULES.find(m => m.id === selected.moduleId)
  const activeLesson = activeModule?.lessons[selected.lessonIndex]
  const isCta = Boolean(activeLesson?.cta)
  const isVsl = Boolean(activeLesson?.vsl)
  const displayTitle = isVsl
    ? vslLessonTitle(activeLesson, activeModule?.title ?? '')
    : activeLesson?.title

  const lessonNumber = MODULES
    .slice(0, MODULES.indexOf(activeModule))
    .reduce((acc, m) => acc + m.lessons.length, 0) + selected.lessonIndex + 1

  const lessonUrl = isVsl ? VSL_VIMEO_URL : activeLesson?.url
  const embedUrl = getEmbedUrl(lessonUrl)
  const hasVideo = isVsl || (!isCta && lessonUrl && lessonUrl !== '#')

  const openWhatsAppCta = useCallback((title) => {
    const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      `Hola Juan, tengo este problema: "${title}" y quiero solucionarlo.`
    )}`
    window.open(href, '_blank', 'noopener,noreferrer')
  }, [])

  useEffect(() => {
    const blockContextMenu = (e) => e.preventDefault()
    const blockCopy = (e) => e.preventDefault()
    const blockKeys = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const key = e.key.toLowerCase()
      if (['c', 's', 'u', 'p', 'a'].includes(key)) e.preventDefault()
    }

    document.addEventListener('contextmenu', blockContextMenu)
    document.addEventListener('copy', blockCopy)
    document.addEventListener('cut', blockCopy)
    document.addEventListener('keydown', blockKeys)

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('copy', blockCopy)
      document.removeEventListener('cut', blockCopy)
      document.removeEventListener('keydown', blockKeys)
    }
  }, [])

  useEffect(() => {
    setPlaying(false)

    if (!hasVideo) {
      setPoster(null)
      return
    }

    const cached = posterCache.get(lessonUrl)
    if (cached) setPoster(cached)

    let cancelled = false
    resolvePoster(lessonUrl).then(url => {
      if (cancelled || !url) return
      setPoster(url)
      preloadPoster(url)
    })

    prefetchNearbyPosters(selected.moduleId, selected.lessonIndex)

    return () => { cancelled = true }
  }, [lessonUrl, hasVideo, selected.moduleId, selected.lessonIndex])

  useEffect(() => {
    const warmCache = () => {
      MODULES.flatMap(m => m.lessons).forEach(lesson => {
        if (lesson.url && lesson.url !== '#') {
          resolvePoster(lesson.url).then(p => p && preloadPoster(p))
        }
      })
    }

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(warmCache)
      return () => cancelIdleCallback(id)
    }

    const timer = setTimeout(warmCache, 600)
    return () => clearTimeout(timer)
  }, [])

  const activeResources = activeLesson?.resources?.length
    ? activeLesson.resources
    : (activeModule?.resources ?? [])

  const handlePosterError = useCallback((e) => {
    const src = e.currentTarget.src
    if (src.includes('maxresdefault')) {
      e.currentTarget.src = src.replace('maxresdefault', 'hqdefault')
      return
    }
    e.currentTarget.style.display = 'none'
  }, [])

  const handlePlay = useCallback(() => {
    if (isCta) {
      openWhatsAppCta(activeLesson.title)
      return
    }
    if (embedUrl) {
      setPlaying(true)
      return
    }
    if (hasVideo) {
      window.open(lessonUrl, '_blank', 'noopener,noreferrer')
    }
  }, [isCta, activeLesson?.title, openWhatsAppCta, embedUrl, hasVideo, lessonUrl])

  return (
    <div
      className={styles.shell}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >

      {/* NAVBAR */}
      <nav className={styles.nav}>
        <button className={styles.navMenu} onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <span className={styles.navLogo}>ATV</span>
        <span className={styles.navUser}>
          {user?.name?.split(' ')[0]}
          <span className={styles.navCode}>{user?.access_code}</span>
        </span>
        <ThemeToggle className={styles.navTheme} />
        <button className={styles.navLogout} onClick={onLogout}>SALIR</button>
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
                    const isLessonCta = Boolean(lesson.cta)
                    const isLessonVsl = Boolean(lesson.vsl)
                    const lessonTitle = isLessonVsl ? vslLessonTitle(lesson, mod.title) : lesson.title
                    const globalNum = MODULES
                      .slice(0, MODULES.indexOf(mod))
                      .reduce((acc, m) => acc + m.lessons.length, 0) + i + 1
                    return (
                      <li key={isLessonVsl ? `${mod.id}-vsl` : i}>
                        <button
                          className={[
                            styles.sidebarLesson,
                            isLessonCta ? styles.sidebarLessonCta : '',
                            isLessonVsl ? styles.sidebarLessonVsl : '',
                            isActive && !isLessonCta ? styles.sidebarLessonActive : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => {
                            setSelected({ moduleId: mod.id, lessonIndex: i })
                            setSidebarOpen(false)
                          }}
                        >
                          <span className={styles.sidebarNum}>{String(globalNum).padStart(2, '0')}</span>
                          <span className={styles.sidebarLessonTitle}>{lessonTitle}</span>
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

            {/* INFO */}
            <div className={styles.info}>
              <p className={styles.infoSection}>
                {isCta ? (
                  <span className={styles.infoPrivate}>Clase privada</span>
                ) : (
                  activeModule?.title
                )}
              </p>
              <h1 className={styles.infoTitle}>
                <span className={styles.infoNum}>{String(lessonNumber).padStart(2, '0')}.</span>
                {displayTitle}
              </h1>
            </div>

            {/* VIDEO / CTA */}
            {(hasVideo || isCta) && (
              <div className={styles.mediaWrap}>
                <div className={styles.media}>
                  <div className={styles.embedWrap}>
                    {playing && embedUrl && !isCta ? (
                      <iframe
                        src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                        className={styles.embed}
                        title={displayTitle}
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    ) : (
                      <button
                        type="button"
                        className={styles.playerPoster}
                        onClick={handlePlay}
                        aria-label={isCta ? `Reclama la clase: ${activeLesson.title}` : `Reproducir ${displayTitle}`}
                      >
                        {(isCta ? activeLesson.poster : poster) && (
                          <img
                            src={isCta ? activeLesson.poster : poster}
                            alt=""
                            className={styles.posterImg}
                            draggable={false}
                            onError={handlePosterError}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        )}
                        <span className={styles.posterOverlay} aria-hidden="true" />
                        {isCta ? (
                          <span className={styles.ctaPlay}>
                            <span className={styles.playBtn}>
                              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M17 8V7a5 5 0 0 0-10 0v1H5v14h14V8h-2zm-8-1a3 3 0 0 1 6 0v1H9V7zm3 6a2 2 0 0 1 1 3.73V19h-2v-2.27A2 2 0 0 1 12 13z" />
                              </svg>
                            </span>
                            <span className={styles.ctaClaim}>Reclama la clase</span>
                          </span>
                        ) : (
                          <span className={styles.playBtn}>
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isCta && (
              <div className={styles.closing}>
                {LESSON_CLOSING.map((paragraph, i) => (
                  <p key={i} className={styles.closingText}>{paragraph}</p>
                ))}
                <p className={styles.closingText}>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">{CALENDLY_URL}</a>
                </p>
              </div>
            )}

            {/* RECURSOS */}
            {!isCta && !isVsl && activeResources.length > 0 && (
              <div className={styles.resources}>
                <p className={styles.resourcesLabel}>RECURSOS</p>
                <ul className={styles.resourcesList}>
                  {activeResources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                          `Hola Juan, necesito el recurso "${r.title}" del video "${displayTitle}"`
                        )}`}
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
        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
          `Hola Juan, estuve viendo el módulo de ${activeModule?.title} — "${displayTitle}" y me surgió una duda.`
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
