import React from 'react'
import styles from './DataLoadBanner.module.css'

export default function DataLoadBanner({ error, onUpload, onRetry }) {
  if (!error) return null

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>⚠</div>
      <div className={styles.text}>
        <div className={styles.title}>Live data unavailable</div>
        <div className={styles.sub}>
          SharePoint authentication is required to fetch live data automatically.
          Load the exported Excel file manually to continue.
        </div>
      </div>
      <div className={styles.actions}>
        <label className={styles.btnUpload}>
          ↑ Load Excel File
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && onUpload(e.target.files[0])}
          />
        </label>
        <button className={styles.btnRetry} onClick={onRetry}>Retry ⟳</button>
      </div>
    </div>
  )
}
