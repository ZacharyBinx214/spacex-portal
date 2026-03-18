import React, { useState, useCallback } from 'react'
import styles from './Configurator.module.css'

const TYPE_OPTIONS = [
  { value: 'Ball Valve',          icon: '◉', label: 'Ball Valve',               sub: 'Series 3000, 4000, 7000, 9000' },
  { value: 'Actuator',            icon: '⚙', label: 'Actuator / VPVL',          sub: 'Pneumatic spring-diaphragm actuators' },
  { value: 'Actuator Controller', icon: '⊞', label: 'Positioner / Controller',  sub: 'StoneL Axiom series' },
  { value: 'Linkage Kit',         icon: '🔧', label: 'Linkage Kit',              sub: 'Valcon linkage kits' },
  { value: 'Manual Handle',       icon: '↕', label: 'Manual Handle',            sub: 'Handle and override kits' },
]

export default function Configurator({ inventory, onAddToCart, inCart, onClose }) {
  const [step, setStep]     = useState('type')
  const [sel, setSel]       = useState({ type: null, size: null, end: null, port: null, body: null })
  const [history, setHistory] = useState([])
  const [showResults, setShowResults] = useState(false)

  const go = (field, value, nextStep) => {
    setSel(prev => ({ ...prev, [field]: value }))
    setHistory(prev => [...prev, step])
    if (nextStep === 'results') {
      setShowResults(true)
    } else {
      setStep(nextStep)
      setShowResults(false)
    }
  }

  const back = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    // Clear state for current step and forward
    const fieldMap = { type: ['type','size','end','port','body'], size: ['size','end','port','body'], end: ['end','port','body'], port: ['port','body'], body: ['body'] }
    const toClear = fieldMap[prev] || []
    setSel(s => {
      const next = { ...s }
      toClear.forEach(f => next[f] = null)
      return next
    })
    setHistory(newHistory)
    setStep(prev)
    setShowResults(false)
  }

  const reset = () => {
    setSel({ type: null, size: null, end: null, port: null, body: null })
    setHistory([])
    setStep('type')
    setShowResults(false)
  }

  const needsSpec = sel.type === 'Ball Valve'

  // Available options based on current selections
  const availSizes = [...new Set(
    inventory.filter(r => r.type === sel.type && r.size).map(r => r.size)
  )].sort((a, b) => parseFloat(a) - parseFloat(b))

  const availBodies = [...new Set(
    inventory.filter(r => r.type === sel.type && (sel.size ? r.size === sel.size : true) && r.body).map(r => r.body)
  )]

  const availEnds = [...new Set(
    inventory.filter(r => r.type === sel.type && r.endConnection).map(r => r.endConnection)
  )]

  const availPorts = [...new Set(
    inventory.filter(r =>
      r.type === sel.type &&
      (!sel.size || r.size === sel.size) &&
      (!sel.end || r.endConnection === sel.end) &&
      r.port
    ).map(r => r.port)
  )]

  // Match results
  const exactMatches = inventory.filter(r => {
    if (r.type !== sel.type) return false
    if (sel.size && r.size !== sel.size) return false
    if (sel.body && r.body !== sel.body) return false
    if (sel.end && r.endConnection !== sel.end) return false
    if (sel.port && r.port !== sel.port) return false
    return true
  })

  const steps = history.length > 0 ? [...history, step] : [step]

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>VALVE CONFIGURATOR</div>
            <div className={styles.subtitle}>
              {showResults
                ? `${exactMatches.length} match${exactMatches.length !== 1 ? 'es' : ''} found`
                : 'Select your requirements'}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Step pills */}
        <div className={styles.stepBar}>
          {['Type','Size','Material','Connection','Port'].map((label, i) => {
            const done = i < steps.length - (showResults ? 0 : 1)
            const active = !showResults && i === steps.length - 1
            return (
              <React.Fragment key={label}>
                <div className={`${styles.stepPill} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
                  <span className={styles.stepNum}>{done && !active ? '✓' : i + 1}</span>
                  <span className={styles.stepLabel}>{label}</span>
                </div>
                {i < 4 && <div className={styles.stepLine} />}
              </React.Fragment>
            )
          })}
        </div>

        <div className={styles.body}>
          {showResults ? (
            <Results
              matches={exactMatches}
              sel={sel}
              inCart={inCart}
              onAdd={onAddToCart}
              onCustomRFQ={() => {
                const summary = [sel.type, sel.size, sel.body, sel.end, sel.port].filter(Boolean).join(' / ')
                onAddToCart({ id: 'CUSTOM-' + Date.now().toString(36).toUpperCase(), description: 'Custom: ' + summary, localQty: 0, networkQty: 0 })
                onClose()
              }}
            />
          ) : step === 'type' ? (
            <Step question="What type of valve or component do you need?">
              <div className={styles.optionGrid}>
                {TYPE_OPTIONS.map(o => (
                  <button key={o.value} className={styles.option}
                    onClick={() => o.value === 'Ball Valve' ? go('type', o.value, 'size') : go('type', o.value, 'results')}>
                    <span className={styles.optionIcon}>{o.icon}</span>
                    <div>
                      <div className={styles.optionLabel}>{o.label}</div>
                      <div className={styles.optionSub}>{o.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Step>
          ) : step === 'size' ? (
            <Step question="What pipe size do you need?">
              <div className={styles.chipGrid}>
                {availSizes.map(sz => (
                  <button key={sz} className={`${styles.chip} ${sel.size === sz ? styles.chipSel : ''}`}
                    onClick={() => go('size', sz, 'body')}>
                    {sz}
                  </button>
                ))}
              </div>
            </Step>
          ) : step === 'body' ? (
            <Step question="What body material do you need?">
              <div className={styles.optionGrid}>
                {availBodies.map(b => (
                  <button key={b} className={styles.option}
                    onClick={() => go('body', b, availEnds.length > 0 ? 'end' : 'results')}>
                    <span className={styles.optionIcon}>{b === 'SS' ? '⬡' : '⬢'}</span>
                    <div>
                      <div className={styles.optionLabel}>{b === 'SS' ? 'Stainless Steel' : 'Carbon Steel'}</div>
                      <div className={styles.optionSub}>{b}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Step>
          ) : step === 'end' ? (
            <Step question="How is the valve connected to the pipe?">
              <div className={styles.chipGrid}>
                {availEnds.map(e => (
                  <button key={e} className={`${styles.chip} ${sel.end === e ? styles.chipSel : ''}`}
                    onClick={() => go('end', e, availPorts.length > 0 ? 'port' : 'results')}>
                    {e}
                  </button>
                ))}
              </div>
            </Step>
          ) : step === 'port' ? (
            <Step question="What bore configuration do you need?">
              <div className={styles.optionGrid}>
                {availPorts.map(p => (
                  <button key={p} className={styles.option}
                    onClick={() => go('port', p, 'results')}>
                    <div>
                      <div className={styles.optionLabel}>{p}</div>
                      <div className={styles.optionSub}>
                        {p === 'Full Port' ? 'Bore matches pipe ID; lower pressure drop'
                          : p === 'Standard Port' ? 'Slightly reduced bore; compact and economical'
                          : 'Smaller bore; lighter weight, lower cost'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Step>
          ) : null}
        </div>

        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={back} style={{ visibility: history.length > 0 ? 'visible' : 'hidden' }}>
            ← Back
          </button>
          <button className={styles.resetBtn} onClick={reset}>Start Over</button>
        </div>
      </div>
    </div>
  )
}

function Step({ question, children }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-bright)', marginBottom: 16 }}>
        {question}
      </div>
      {children}
    </div>
  )
}

function Results({ matches, sel, inCart, onAdd, onCustomRFQ }) {
  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>○</div>
        <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700, letterSpacing: 1, color: 'var(--text-bright)', marginBottom: 8, textTransform: 'uppercase' }}>
          No Inventory Match
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20, lineHeight: 1.6 }}>
          We don't have an exact match in current stock.<br />Submit a custom RFQ and our team will source it.
        </div>
        <button style={{ background: 'var(--accent2)', color: '#fff', border: 'none', padding: '11px 24px', fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
          onClick={onCustomRFQ}>
          Submit Custom RFQ ▸
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12 }}>
        {matches.length} Result{matches.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {matches.slice(0, 8).map((r, i) => {
          const added = inCart(r.id)
          return (
            <div key={r.id + i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--local-color)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-bright)', marginBottom: 3 }}>{r.id}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 5 }}>{r.description}</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--local-color)' }}>Local: {r.localQty}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--network-color)' }}>Network: {r.networkQty}</span>
                </div>
              </div>
              <button
                onClick={() => onAdd(r)}
                style={{ background: added ? 'rgba(224,224,224,0.04)' : 'transparent', border: `1px solid ${added ? 'var(--local-color)' : 'var(--border-bright)'}`, color: added ? 'var(--local-color)' : 'var(--text-dim)', padding: '6px 12px', fontFamily: 'var(--font-condensed)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {added ? '✓ Added' : '+ RFQ'}
              </button>
            </div>
          )
        })}
      </div>
      {matches.length > 0 && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }} onClick={onCustomRFQ}>
            Need something different? Submit a custom RFQ →
          </button>
        </div>
      )}
    </div>
  )
}
