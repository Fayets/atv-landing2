import { useEffect, useState } from 'react'
import { getSession } from '../api/auth'
import styles from './ProtectedRoute.module.css'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setStatus('authenticated')
      } else {
        window.location.replace('https://ecosystem.atvos.io')
      }
    })
  }, [])

  if (status === 'loading') {
    return (
      <div className={styles.screen}>
        <div className={styles.logo}>
          <span className={styles.logoA}>A</span>
          <span className={styles.logoT}>T</span>
          <span className={styles.logoV}>V</span>
        </div>
      </div>
    )
  }

  return children
}
