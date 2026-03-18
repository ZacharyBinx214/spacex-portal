import React, { useMemo } from 'react'
import styles from './Slicers.module.css'

const SLICER_DEFS = [
  { key: 'series',        label: 'Series',         order: ['3000','4000','7000','9000'] },
  { key: 'size',          label: 'Size',            order: ['1/4″','3/8″','1/2″','3/4″','1″','1-1/4″','1-1/2″','2″','3″','4″','6″','8″','10″'] },
  { key: 'endConnection', label: 'End Connection',  order: ['NPT','Flanged','Socket Weld','Wafer','Lug'] },
  { key: 'port',          label: 'Port / Bore',     order: ['Full Port','Standard Port','Reduced Bore'] },
  { key: 'body',          label: 'Body Material',   order: ['Carbon','SS'] },
]

export default function Slicers({ inventory, active, onToggle, onClear }) {
  const counts = useMemo(() => {
    const result = {}
    SLICER_DEFS.forEach(({ key }) => {
      result[key] = {}
      inventory.forEach(r => {
        const val = r[key]
        if (val) result[key][val] = (result[key][val] || 0) + 1
      })
    })
    return result
  }, [inventory])

  const hasActive = Object.values(active).some(set => set.size > 0)

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Refine by Specification</span>
        {hasActive && (
          <button className={styles.clearAll} onClick={onClear}>Clear All ✕</button>
        )}
      </div>
      <div className={styles.groups}>
        {SLICER_DEFS.map(({ key, label, order }) => {
          const available = order.filter(v => counts[key]?.[v] > 0)
          if (available.length === 0) return null
          return (
            <div className={styles.group} key={key}>
              <div className={styles.groupLabel}>{label}</div>
              <div className={styles.chips}>
                {available.map(val => (
                  <button
                    key={val}
                    className={`${styles.chip} ${active[key]?.has(val) ? styles.chipActive : ''}`}
                    onClick={() => onToggle(key, val)}
                  >
                    {val}
                    <span className={styles.chipCount}>{counts[key][val]}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
