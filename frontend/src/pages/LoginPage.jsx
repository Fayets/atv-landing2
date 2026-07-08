import { useState } from 'react'
import { loginWithCode } from '../api/leads'
import styles from './LoginPage.module.css'

function IconArrow() {
  return (
    <svg
      className={styles.submitIcon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LoginPage({ onLogin }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Ingresá tu clave de acceso.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const user = await loginWithCode(trimmed)
      onLogin(user)
    } catch {
      setError('Clave inválida. Verificá que la ingresaste correctamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <img
              src={`${import.meta.env.BASE_URL}atv-logo.png`}
              alt="ATV — Aumenta Tu Valor"
              className={styles.logo}
              width={72}
              height={72}
            />
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <label className={styles.field}>
              <span className={styles.srOnly}>Clave de acceso</span>
              <input
                className={styles.input}
                type="text"
                name="access_code"
                autoComplete="off"
                placeholder="ATV-0000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  if (error) setError('')
                }}
                disabled={loading}
                autoFocus
              />
            </label>

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
              aria-label={loading ? 'Verificando' : 'Ingresar'}
            >
              {loading ? (
                <span className={styles.loading} aria-hidden="true" />
              ) : (
                <IconArrow />
              )}
            </button>
          </form>

          <p className={styles.footer}>Solo miembros autorizados</p>
        </div>
      </main>
    </div>
  )
}
