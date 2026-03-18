import React, { useMemo } from 'react'
import styles from './StatsBar.module.css'

export default function StatsBar({ inventory }) {
  const stats = useMemo(() => {
    const total = inventory.length
    const localUnits = inventory.reduce((s, r) => s + (r.localQty || 0), 0)
    const networkUnits = inventory.reduce((s, r) => s + (r.networkQty || 0), 0)
    const actuators = inventory.filter(r => r.type === 'Actuator Controller' || r.type === 'Actuator').length
    return { total, localUnits, networkUnits, actuators }
  }, [inventory])

  return (
    <div className={styles.bar}>
      <StatCard label="Total SKUs" value={stats.total.toLocaleString()} sub="Jamesbury + StoneL" accent="accent" />
      <StatCard label="Local Available" value={stats.localUnits.toLocaleString()} sub="OH Jacksonville" accent="local" />
      <StatCard label="Network Available" value={stats.networkUnits.toLocaleString()} sub="OH Jax Network" accent="network" />
      <StatCard label="Actuators / Controllers" value={stats.actuators.toLocaleString()} sub="VPVL + StoneL" accent="red" />
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      <div className={styles.sub}>{sub}</div>
    </div>
  )
}
