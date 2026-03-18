import React from 'react'
import styles from './Header.module.css'

export default function Header({ lastUpdated, source, onCartOpen, cartCount, onRefresh, onUpload }) {
  const fmtDate = (d) => d
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '--'

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logoBlock}>
          <span className={styles.logoAWC}>AWC</span>
          <div className={styles.divider} />
          <span className={styles.logoSub}>SUPPLY PORTAL</span>
        </div>
        <div className={styles.divider} />
        <span className={styles.title}>Valve &amp; Actuator Inventory — SpaceX</span>

        <div className={styles.right}>
          {source === 'sharepoint' && (
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              LIVE
            </div>
          )}
          {source === 'upload' && (
            <div className={styles.uploadBadge}>FILE LOADED</div>
          )}
          <span className={styles.updated}>{fmtDate(lastUpdated)}</span>

          <label className={styles.btnUpload} title="Load Excel file">
            ↑ Load File
            <input
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => e.target.files[0] && onUpload(e.target.files[0])}
            />
          </label>

          <button className={styles.btnRefresh} onClick={onRefresh} title="Refresh from SharePoint">
            ⟳
          </button>

          <button className={styles.btnCart} onClick={onCartOpen}>
            View RFQ ▸
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
