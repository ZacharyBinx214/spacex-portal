import React, { useState, useMemo } from 'react'
import styles from './InventoryTable.module.css'

const PAGE_SIZE = 50

export default function InventoryTable({ inventory, inCart, onToggle }) {
  const [sort, setSort]         = useState({ col: 'networkQty', dir: -1 })
  const [page, setPage]         = useState(1)

  const sorted = useMemo(() => {
    return [...inventory].sort((a, b) => {
      let av = a[sort.col], bv = b[sort.col]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (av < bv) return -sort.dir
      if (av > bv) return sort.dir
      return 0
    })
  }, [inventory, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const slice      = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSort = (col) => {
    setSort(prev => ({ col, dir: prev.col === col ? -prev.dir : (col === 'localQty' || col === 'networkQty' ? -1 : 1) }))
    setPage(1)
  }

  const SortTh = ({ col, children }) => (
    <th className={`${styles.th} ${sort.col === col ? styles.sorted : ''}`} onClick={() => handleSort(col)}>
      {children}
      <span className={styles.arrow}>{sort.col === col ? (sort.dir === 1 ? ' ↑' : ' ↓') : ' ↕'}</span>
    </th>
  )

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortTh col="brand">Brand</SortTh>
            <SortTh col="id">Model</SortTh>
            <SortTh col="description">Description</SortTh>
            <SortTh col="type">Type</SortTh>
            <SortTh col="size">Size</SortTh>
            <SortTh col="body">Material</SortTh>
            <SortTh col="localQty">
              <span className={styles.localLabel}>⬤ Local</span>
            </SortTh>
            <SortTh col="networkQty">
              <span className={styles.networkLabel}>⬤ Network</span>
            </SortTh>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {slice.length === 0 ? (
            <tr>
              <td colSpan={9} className={styles.empty}>NO MATCHING INVENTORY FOUND</td>
            </tr>
          ) : slice.map((r, i) => (
            <Row key={r.id + i} item={r} inCart={inCart(r.id)} onToggle={onToggle} />
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
        </span>
        <div className={styles.pageBtns}>
          <PageBtn disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹</PageBtn>
          {pageRange(safePage, totalPages).map((p, i) =>
            p === '…'
              ? <PageBtn key={i} disabled>…</PageBtn>
              : <PageBtn key={p} active={p === safePage} onClick={() => setPage(p)}>{p}</PageBtn>
          )}
          <PageBtn disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>›</PageBtn>
        </div>
      </div>
    </div>
  )
}

function Row({ item, inCart, onToggle }) {
  const { id, description, brand, type, size, body, localQty, networkQty } = item
  const maxQ = Math.max(networkQty, 1)

  return (
    <tr className={styles.row}>
      <td>
        <span className={`${styles.brandPill} ${brand === 'StoneL' ? styles.brandStonel : styles.brandJamesbury}`}>
          {brand}
        </span>
      </td>
      <td><span className={styles.model}>{id}</span></td>
      <td><span className={styles.desc}>{description}</span></td>
      <td><span className={styles.typeTag}>{type}</span></td>
      <td><span className={styles.mono}>{size || '—'}</span></td>
      <td><span className={styles.mono}>{body || '—'}</span></td>

      {/* Local availability */}
      <td>
        <div className={styles.stockCell}>
          <span className={`${styles.stockNum} ${localQty > 0 ? styles.localNum : styles.zeroNum}`}>
            {localQty}
          </span>
          <div className={styles.stockBar}>
            <div
              className={styles.stockFill}
              style={{
                width: `${Math.min(100, Math.round((localQty / maxQ) * 100))}%`,
                background: 'var(--local-color)',
                opacity: localQty > 0 ? 1 : 0.15,
              }}
            />
          </div>
        </div>
      </td>

      {/* Network availability */}
      <td>
        <div className={styles.stockCell}>
          <span className={`${styles.stockNum} ${networkQty > 0 ? styles.networkNum : styles.zeroNum}`}>
            {networkQty}
          </span>
          <div className={styles.stockBar}>
            <div
              className={styles.stockFill}
              style={{
                width: `${Math.min(100, Math.round((networkQty / maxQ) * 100))}%`,
                background: 'var(--network-color)',
                opacity: networkQty > 0 ? 1 : 0.15,
              }}
            />
          </div>
        </div>
      </td>

      <td>
        <button
          className={`${styles.addBtn} ${inCart ? styles.added : ''}`}
          onClick={() => onToggle(item)}
        >
          {inCart ? '✓ Added' : '+ RFQ'}
        </button>
      </td>
    </tr>
  )
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button
      className={`${styles.pageBtn} ${active ? styles.pageBtnActive : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function pageRange(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (cur >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', cur - 1, cur, cur + 1, '…', total]
}
