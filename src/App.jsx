import React, { useState, useMemo, useCallback } from 'react'
import Header         from './components/Header.jsx'
import StatsBar       from './components/StatsBar.jsx'
import Slicers        from './components/Slicers.jsx'
import InventoryTable from './components/InventoryTable.jsx'
import CartPanel      from './components/CartPanel.jsx'
import Configurator   from './components/Configurator.jsx'
import DataLoadBanner from './components/DataLoadBanner.jsx'
import { useInventory } from './hooks/useInventory.js'
import { useCart }      from './hooks/useCart.js'
import styles from './App.module.css'

const SLICER_KEYS = ['series', 'size', 'endConnection', 'port', 'body']

export default function App() {
  const { inventory, loading, error, source, lastUpdated, loadFromSharePoint, loadFromFile } = useInventory()
  const { cart, toggle, remove, clear, inCart } = useCart()

  const [search,        setSearch]        = useState('')
  const [brandFilter,   setBrandFilter]   = useState('')
  const [typeFilter,    setTypeFilter]    = useState('')
  const [stockFilter,   setStockFilter]   = useState('')
  const [slicerActive,  setSlicerActive]  = useState(() =>
    Object.fromEntries(SLICER_KEYS.map(k => [k, new Set()]))
  )
  const [cartOpen,      setCartOpen]      = useState(false)
  const [cfgOpen,       setCfgOpen]       = useState(false)

  // Slicer toggle
  const handleSlicerToggle = useCallback((key, val) => {
    setSlicerActive(prev => {
      const next = { ...prev, [key]: new Set(prev[key]) }
      next[key].has(val) ? next[key].delete(val) : next[key].add(val)
      return next
    })
  }, [])

  const handleSlicerClear = useCallback(() => {
    setSlicerActive(Object.fromEntries(SLICER_KEYS.map(k => [k, new Set()])))
  }, [])

  // Filtered inventory
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return inventory.filter(r => {
      if (brandFilter && r.brand !== brandFilter) return false
      if (typeFilter  && r.type  !== typeFilter)  return false
      if (stockFilter === 'local'   && r.localQty   <= 0) return false
      if (stockFilter === 'network' && r.networkQty <= 0) return false

      // Slicers - strict: must match if active
      for (const key of SLICER_KEYS) {
        const active = slicerActive[key]
        if (active.size === 0) continue
        if (!r[key] || !active.has(r[key])) return false
      }

      // Text search
      if (q) {
        const hay = `${r.id} ${r.description} ${r.category} ${r.type}`.toLowerCase()
        if (!q.split(' ').every(w => hay.includes(w))) return false
      }

      return true
    })
  }, [inventory, search, brandFilter, typeFilter, stockFilter, slicerActive])

  // Unique types for dropdown
  const types = useMemo(() =>
    [...new Set(inventory.map(r => r.type))].sort()
  , [inventory])

  return (
    <div className={styles.app}>
      <Header
        lastUpdated={lastUpdated}
        source={source}
        cartCount={cart.length}
        onCartOpen={() => setCartOpen(true)}
        onRefresh={loadFromSharePoint}
        onUpload={loadFromFile}
      />

      <main className={styles.main}>

        {/* Error / load banner */}
        <DataLoadBanner
          error={error}
          onUpload={loadFromFile}
          onRetry={loadFromSharePoint}
        />

        {/* Loading state */}
        {loading && (
          <div className={styles.loadingBar}>
            <div className={styles.loadingInner} />
          </div>
        )}

        {!loading && inventory.length > 0 && (
          <>
            <StatsBar inventory={inventory} />

            {/* Controls */}
            <div className={styles.controls}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>⌕</span>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search model, description, category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
                )}
              </div>

              <div className={styles.filterRow}>
                <select className={styles.select} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                  <option value="">All Brands</option>
                  <option value="Jamesbury">Jamesbury</option>
                  <option value="StoneL">StoneL</option>
                </select>

                <select className={styles.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select className={styles.select} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
                  <option value="">All Stock</option>
                  <option value="local">Local Available</option>
                  <option value="network">Network Available</option>
                </select>
              </div>

              <div className={styles.resultCount}>
                <span>{filtered.length.toLocaleString()}</span> results
              </div>
            </div>

            {/* Configurator bar */}
            <div className={styles.cfgBar}>
              <div className={styles.cfgBarLeft}>
                <div className={styles.cfgBarTitle}>Don't know the part number?</div>
                <div className={styles.cfgBarSub}>Use the configurator to find what you need.</div>
              </div>
              <button className={styles.cfgBtn} onClick={() => setCfgOpen(true)}>
                ⊕ New Valve Configuration
              </button>
            </div>

            {/* Slicers */}
            <Slicers
              inventory={inventory}
              active={slicerActive}
              onToggle={handleSlicerToggle}
              onClear={handleSlicerClear}
            />

            {/* Table */}
            <InventoryTable
              inventory={filtered}
              inCart={inCart}
              onToggle={toggle}
            />
          </>
        )}

        {!loading && inventory.length === 0 && !error && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>○</div>
            <div className={styles.emptyTitle}>No Data Loaded</div>
            <div className={styles.emptySub}>Load an Excel file to get started.</div>
            <label className={styles.emptyUpload}>
              ↑ Load Excel File
              <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && loadFromFile(e.target.files[0])} />
            </label>
          </div>
        )}
      </main>

      {/* Cart panel */}
      {cartOpen && (
        <>
          <div className={styles.cartOverlay} onClick={() => setCartOpen(false)} />
          <CartPanel
            cart={cart}
            onRemove={remove}
            onClose={() => setCartOpen(false)}
            onClear={clear}
          />
        </>
      )}

      {/* Configurator */}
      {cfgOpen && (
        <Configurator
          inventory={inventory}
          inCart={inCart}
          onAddToCart={toggle}
          onClose={() => setCfgOpen(false)}
        />
      )}
    </div>
  )
}
