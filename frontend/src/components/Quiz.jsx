import { useState } from 'react'
import styles from './Quiz.module.css'
import { submitLead } from '../api/leads'

const STEPS = [
  {
    id: 'situation',
    q: '¿Cuál es tu situación hoy?',
    type: 'options',
    opts: [
      'Tengo contenido pero no monetizo',
      'Tengo clientes pero no puedo escalar',
      'Arranco de cero',
      'Tengo agencia o consultoría y quiero crecer',
    ],
  },
  {
    id: 'revenue',
    q: '¿Cuánto facturás por mes hoy?',
    type: 'options',
    opts: [
      'Todavía no facturo',
      'Menos de $1.000/mes',
      'Entre $1.000 y $5.000/mes',
      'Más de $5.000/mes',
    ],
  },
  {
    id: 'obstacle',
    q: '¿Qué es lo que más te está frenando ahora?',
    type: 'options',
    opts: [
      'No sé de dónde sacar clientes',
      'No tengo una oferta clara',
      'Cobro menos de lo que vale',
      'No tengo sistema para escalar',
    ],
  },
  {
    id: 'niche',
    q: '¿En qué nicho estás o querés estar?',
    type: 'options',
    opts: [
      'Coaching o mentoría',
      'Marketing o growth',
      'Fitness o salud',
      'Otra consultoría',
    ],
  },
  {
    id: 'contact',
    q: 'Dejame tus datos y te mando el diagnóstico de escalabilidad',
    type: 'form',
  },
]

export default function Quiz({ onComplete }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const step = STEPS[current]
  const progress = ((current + 1) / STEPS.length) * 100
  const isLast = current === STEPS.length - 1

  const canNext = step.type === 'options'
    ? !!answers[step.id]
    : form.name && form.email && form.phone

  const handleOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [step.id]: opt }))
  }

  const handleNext = async () => {
    if (isLast) {
      setLoading(true)
      setError(null)
      try {
        const payload = { ...answers, ...form }
        await submitLead(payload)
        onComplete(payload)
      } catch (e) {
        setError('Algo falló. Probá de nuevo.')
        setLoading(false)
      }
      return
    }
    setCurrent((c) => c + 1)
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.stepLabel}>Pregunta {current + 1} de {STEPS.length}</div>
        <div className={styles.question}>{step.q}</div>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.body}>
        {step.type === 'options' && (
          <div className={styles.options}>
            {step.opts.map((opt) => (
              <button
                key={opt}
                className={`${styles.opt} ${answers[step.id] === opt ? styles.selected : ''}`}
                onClick={() => handleOption(opt)}
              >
                <span>{opt}</span>
                <i className="ti ti-arrow-right" />
              </button>
            ))}
          </div>
        )}

        {step.type === 'form' && (
          <div className={styles.formFields}>
            <input
              className={styles.input}
              type="text"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className={styles.input}
              type="email"
              placeholder="Tu email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className={styles.input}
              type="tel"
              placeholder="Tu WhatsApp (ej +5491112345678)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.backBtn}
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <i className="ti ti-arrow-left" /> Atrás
        </button>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i < current ? styles.done : ''} ${i === current ? styles.active : ''}`}
            />
          ))}
        </div>

        <button
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={!canNext || loading}
        >
          {loading ? (
            <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} />
          ) : isLast ? (
            <><span>Quiero mi diagnóstico de escalabilidad</span><i className="ti ti-arrow-right" /></>
          ) : (
            <i className="ti ti-arrow-right" />
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
