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

const MODULES = [
  {
    id: 'marketing',
    title: 'MARKETING',
    lessons: [
      {
        title: 'Ecosistema de contenido',
        url: 'https://vimeo.com/1161067574',
        resources: [
          { title: 'Entregables', url: 'https://miro.com/app/board/uXjVGJOeQtA=/?share_link_id=886926435324' },
        ],
      },
      {
        title: 'Optimización de perfil',
        url: 'https://www.loom.com/share/d7e3937496a747ffbf9264f7aa82d014',
        resources: [
          { title: 'Entregables', url: 'https://docs.google.com/document/d/1w8QVeY_uwJ52ddfW7XC7TuLAQF5ihoy3GzG4_nlbQzU/copy' },
        ],
      },
      {
        title: 'El detrás de mis secuencias de historias',
        url: 'https://www.youtube.com/watch?v=Rcx0O4yojsI&t=1327s',
        resources: [
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1qCMtYToU1ksAYGGEy9QuZTgrrMjUYaVN5J4qsVrE_xs/copy' },
        ],
      },
      {
        title: 'Cómo hacer tus secuencias de historias',
        url: 'https://vimeo.com/1161136006',
        resources: [
          { title: 'Recurso', url: 'https://miro.com/app/board/uXjVGNV4Ejg=/?share_link_id=401015036323' },
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
    ],
    resources: [],
  },
  {
    id: 'bases',
    title: 'BASES',
    lessons: [
      {
        title: 'Volumen, análisis y apalancamiento',
        url: 'https://vimeo.com/1160887683',
        resources: [
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1AW6NUMzlhnsTtu48KsV9ROWcCRb2CEA4ytwihfocNaQ/copy' },
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1lzDY0t1nFmgatV0GXwMXCfcSqoRl8Pwq0xMK7yQFgyU/copy' },
        ],
      },
      {
        title: 'Cómo funciona un negocio $100k/mes con poca gente y mucho margen',
        url: 'https://www.youtube.com/watch?v=Ebum9B4BSSM&t=1314s',
        resources: [
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1xGVKJDIo_AbpKTi4Fsyt1rmx7Znhi768TF6HycOETtA/copy' },
        ],
      },
      {
        title: 'Marketing y contenido $100k/mes',
        url: 'https://www.youtube.com/watch?v=-AnBdcU66OM&t=2106s',
        resources: [
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1Eq6jTcPrsP09gS3ByZE329MniH9Ai-PQafDclCFs1so/copy' },
        ],
      },
      {
        title: 'Servicio, upsells y carga operativa $100k/mes',
        url: 'https://www.youtube.com/watch?v=R1Cr7Xer-KE&t=1158s',
        resources: [
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1iYjbjzKIf-xC974pFqchy4JVRvb-EFArp8_CC8b-nJk/copy' },
        ],
      },
      {
        title: 'Dónde enfocarnos para escalar a $100k/mes',
        url: 'https://vimeo.com/1161065905',
        resources: [
          { title: 'SOP', url: 'https://docs.google.com/document/d/1dB_FFZUsJtv3b18RyiyHlUCKHye0Zf6AI7zJ6jSrFsA/copy' },
        ],
      },
      {
        title: 'Cómo gestionar tu energía para hacer $100k/mes',
        url: 'https://www.loom.com/share/668e0231c3764b6e8cced95ce39322a6',
        resources: [],
      },
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
          { title: 'Recurso', url: 'https://docs.google.com/document/d/1Reqr0JCIcl4nLdJeNZTfBlzQi00AwWSCvRj3rxt8Xg8/copy' },
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
          { title: 'Entregable', url: 'https://miro.com/app/board/uXjVGJOeQtA=/?share_link_id=886926435324' },
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
        description: 'En esta clase te muestro cómo usar Claude para construir tu contenido en base a datos reales.\n\nVas a aprender a unir los tres tipos de marketing datos, estructura y psicología para dejar de adivinar qué subir.\n\nLo trabajo en vivo con un caso real cargando llamadas y formularios de onboarding para sacar el avatar y alinear todo el contenido.\n\nTe recomiendo verla con la compu al lado e ir aplicando cada paso mientras avanza.',
        resources: [],
      },
      {
        title: 'Cómo usar Poppy',
        url: 'https://www.loom.com/share/e1d13ffe58d140aab6fbc62407eb0eab',
        resources: [
          { title: 'Comprar Poppy', url: 'https://getpoppy.ai/?coupon=REFERRAL&affiliate=aumenta_tu_valor' },
          { title: 'Template Poppy', url: 'https://app.getpoppy.ai/boards/gentle-star-lqLuo' },
        ],
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
    ],
    resources: [],
  },
]

export default function CoursePage({ user, onLogout }) {
  const [selected, setSelected] = useState({ moduleId: 'marketing', lessonIndex: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [poster, setPoster] = useState(null)

  const activeModule = MODULES.find(m => m.id === selected.moduleId)
  const activeLesson = activeModule?.lessons[selected.lessonIndex]
  const lessonNumber = MODULES
    .slice(0, MODULES.indexOf(activeModule))
    .reduce((acc, m) => acc + m.lessons.length, 0) + selected.lessonIndex + 1

  const lessonUrl = activeLesson?.url
  const embedUrl = getEmbedUrl(lessonUrl)
  const hasVideo = lessonUrl && lessonUrl !== '#'

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
    if (embedUrl) {
      setPlaying(true)
      return
    }
    if (hasVideo) {
      window.open(lessonUrl, '_blank', 'noopener,noreferrer')
    }
  }, [embedUrl, hasVideo, lessonUrl])

  const openResource = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

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

            {/* INFO */}
            <div className={styles.info}>
              <p className={styles.infoSection}>{activeModule?.title}</p>
              <h1 className={styles.infoTitle}>
                <span className={styles.infoNum}>{String(lessonNumber).padStart(2, '0')}.</span>
                {activeLesson?.title}
              </h1>
            </div>

            {/* VIDEO */}
            {hasVideo && (
              <div className={styles.mediaWrap}>
                <div className={styles.media}>
                  <div className={styles.embedWrap}>
                    {playing && embedUrl ? (
                      <iframe
                        src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                        className={styles.embed}
                        title={activeLesson.title}
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
                        aria-label={`Reproducir ${activeLesson.title}`}
                      >
                        {poster && (
                          <img
                            src={poster}
                            alt=""
                            className={styles.posterImg}
                            draggable={false}
                            onError={handlePosterError}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        )}
                        <span className={styles.posterOverlay} aria-hidden="true" />
                        <span className={styles.playBtn}>
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeLesson?.description && (
              <div className={styles.description}>
                {activeLesson.description.split('\n\n').map((paragraph, i) => (
                  <p key={i} className={styles.descText}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* RECURSOS */}
            {activeResources.length > 0 && (
              <div className={styles.resources}>
                <p className={styles.resourcesLabel}>RECURSOS</p>
                <ul className={styles.resourcesList}>
                  {activeResources.map((r, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className={styles.resourceLink}
                        onClick={() => openResource(r.url)}
                      >
                        <span className={styles.resourceIcon}>↓</span>
                        {r.title}
                      </button>
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
