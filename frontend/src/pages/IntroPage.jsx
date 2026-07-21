import { useEffect, useRef, useState } from 'react'
import styles from './IntroPage.module.css'

const INTRO_VIMEO_ID = '1210850489'
const CALENDLY_URL = 'https://calendly.com/aumentatuvalor/llamada-de-conocimeinto-atv'
const SPEEDS = [1, 1.25, 1.5, 2]
const FADE_WINDOW_SECONDS = 10

function fadeVolumeNearEnd(seconds, duration) {
  if (!duration || duration <= 0) return 1
  const fadeStart = Math.max(0, duration - FADE_WINDOW_SECONDS)
  if (seconds <= fadeStart) return 1
  if (seconds >= duration) return 0
  return Math.max(0, 1 - (seconds - fadeStart) / (duration - fadeStart))
}

function loadVimeoPlayer() {
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo.Player)
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-vimeo-api]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Vimeo.Player))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://player.vimeo.com/api/player.js'
    script.async = true
    script.dataset.vimeoApi = 'true'
    script.onload = () => resolve(window.Vimeo.Player)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function IntroPage({ onContinue }) {
  const iframeRef = useRef(null)
  const playerRef = useRef(null)
  const maxWatchedRef = useRef(0)
  const durationRef = useRef(0)
  const onContinueRef = useRef(onContinue)

  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showCta, setShowCta] = useState(false)
  const [showSecondBtn, setShowSecondBtn] = useState(false)

  useEffect(() => {
    onContinueRef.current = onContinue
  }, [onContinue])

  useEffect(() => {
    if (!showCta) {
      setShowSecondBtn(false)
      return
    }
    const timer = setTimeout(() => setShowSecondBtn(true), 1200)
    return () => clearTimeout(timer)
  }, [showCta])

  useEffect(() => {
    let cancelled = false
    let player
    let ctaShown = false

    const revealCta = async () => {
      if (cancelled || ctaShown) return
      ctaShown = true
      try {
        await playerRef.current?.setVolume?.(0)
        await playerRef.current?.pause?.()
      } catch { /* ignore */ }
      setShowCta(true)
      setPaused(true)
    }

    async function setup() {
      try {
        const Player = await loadVimeoPlayer()
        if (cancelled || !iframeRef.current) return

        player = new Player(iframeRef.current)
        playerRef.current = player
        await player.setVolume(1)

        const syncDuration = async () => {
          try {
            const dur = await player.getDuration()
            if (!cancelled && dur > 0) {
              durationRef.current = dur
              setDuration(dur)
            }
          } catch { /* ignore */ }
        }

        await syncDuration()
        player.on('loaded', syncDuration)

        const onTime = (data) => {
          if (data.seconds > maxWatchedRef.current) {
            maxWatchedRef.current = data.seconds
          }
          setCurrentTime(data.seconds)

          const dur = durationRef.current || data.duration || 0
          if (dur > 0 && !durationRef.current) {
            durationRef.current = dur
            setDuration(dur)
          }

          if (!ctaShown && dur > 0) {
            player.setVolume(fadeVolumeNearEnd(data.seconds, dur)).catch(() => {})
          }

          // Solo al corte real (no anticipar). Fallback por si Vimeo no manda "ended".
          if (dur > 0 && data.seconds >= dur - 0.05) {
            revealCta()
          }
        }

        const blockSeekForward = (data) => {
          const allowed = maxWatchedRef.current + 0.35
          if (data.seconds > allowed) {
            player.setCurrentTime(maxWatchedRef.current).catch(() => {})
          }
        }

        const onEnded = () => {
          revealCta()
        }

        const onPlay = () => {
          setStarted(true)
          setPaused(false)
        }

        const onPause = async () => {
          setPaused(true)
          try {
            const ended = await player.getEnded()
            if (ended) revealCta()
          } catch { /* ignore */ }
        }

        player.on('timeupdate', onTime)
        player.on('seeked', blockSeekForward)
        player.on('ended', onEnded)
        player.on('play', onPlay)
        player.on('pause', onPause)
      } catch { /* ignore */ }
    }

    setup()

    return () => {
      cancelled = true
      if (player) {
        try {
          player.off('timeupdate')
          player.off('seeked')
          player.off('ended')
          player.off('play')
          player.off('pause')
          player.off('loaded')
        } catch { /* ignore */ }
      }
      playerRef.current = null
    }
  }, [])

  const handleStart = async () => {
    try {
      await playerRef.current?.play?.()
      setStarted(true)
      setPaused(false)
    } catch { /* ignore */ }
  }

  const togglePause = async () => {
    if (showCta) return
    const player = playerRef.current
    if (!player) return
    try {
      const isPaused = await player.getPaused()
      if (isPaused) {
        await player.play()
        setPaused(false)
      } else {
        await player.pause()
        setPaused(true)
      }
    } catch { /* ignore */ }
  }

  const changeSpeed = async (rate) => {
    if (showCta) return
    setSpeed(rate)
    try {
      await playerRef.current?.setPlaybackRate?.(rate)
    } catch { /* ignore */ }
  }

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const remaining = Math.max(0, duration - currentTime)

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <main className={styles.main}>
        <div className={styles.stage}>
          <div className={styles.aura} aria-hidden="true" />

          <div className={styles.videoWrap}>
            <iframe
              ref={iframeRef}
              className={styles.video}
              src={`https://player.vimeo.com/video/${INTRO_VIMEO_ID}?title=0&byline=0&portrait=0&dnt=1&controls=0&playsinline=1`}
              title="Bienvenida ATV"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
            <div className={styles.videoFrame} aria-hidden="true" />

            {!started && !showCta && (
              <button
                type="button"
                className={styles.startPlay}
                onClick={handleStart}
                aria-label="Reproducir video"
              >
                <span className={styles.startPlayBtn}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            )}
          </div>

          {started && !showCta && (
            <div className={styles.playerBar}>
              <button
                type="button"
                className={styles.finishCtrlBtn}
                onClick={togglePause}
                aria-label={paused ? 'Reproducir' : 'Pausar'}
              >
                {paused ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                  </svg>
                )}
              </button>

              <div className={styles.timeBlock}>
                <div className={styles.progressTrack} aria-hidden="true">
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.timeRow}>
                  <span>{formatTime(currentTime)}</span>
                  <span>Faltan {formatTime(remaining)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className={styles.speedGroup} role="group" aria-label="Velocidad">
                {SPEEDS.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    className={`${styles.speedBtn} ${speed === rate ? styles.speedBtnActive : ''}`}
                    onClick={() => changeSpeed(rate)}
                  >
                    {rate === 1 ? '1x' : `${rate}x`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showCta && (
            <div className={styles.ctaBelow} role="dialog" aria-label="Opciones">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                Agendar llamada
              </a>
              {showSecondBtn && (
                <button type="button" className={styles.ctaSecondary} onClick={onContinue}>
                  Continuar con el curso (+11 horas)
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
