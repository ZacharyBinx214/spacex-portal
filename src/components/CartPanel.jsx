import React, { useState } from 'react'
import styles from './CartPanel.module.css'

export default function CartPanel({ cart, onRemove, onClose, onClear }) {
  const [submitted, setSubmitted] = useState(false)
  const [rfqRef, setRfqRef]       = useState('')

  const handleSubmit = () => {
    const ref = 'AWC-SX-' + Date.now().toString(36).toUpperCase()
    setRfqRef(ref)
    setSubmitted(true)
    onClear()
  }

  const handleClose = () => {
    setSubmitted(false)
    onClose()
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>RFQ LIST</span>
        <button className={styles.closeBtn} onClick={handleClose}>✕</button>
      </div>

      {submitted ? (
        <div className={styles.success}>
          <div className={styles.checkmark}>✓</div>
          <div className={styles.successTitle}>RFQ SUBMITTED</div>
          <p className={styles.successText}>
            An AWC representative will follow up within 2 business hours with pricing and lead time confirmation.
          </p>
          <div className={styles.refLabel}>Reference: <span className={styles.ref}>{rfqRef}</span></div>
          <button className={styles.btnDone} onClick={handleClose}>Done</button>
        </div>
      ) : (
        <>
          <div className={styles.items}>
            {cart.length === 0 ? (
              <div className={styles.empty}>
                No items added yet.<br /><br />
                Browse inventory and click <strong>+ RFQ</strong> on items you need.
              </div>
            ) : cart.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemModel}>{item.id}</div>
                  <div className={styles.itemDesc}>{item.description}</div>
                  <div className={styles.itemStock}>
                    <span className={styles.localStock}>Local: {item.localQty ?? 0}</span>
                    <span className={styles.networkStock}>Network: {item.networkQty ?? 0}</span>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => onRemove(item.id)}>×</button>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.summary}>
              {cart.length} item{cart.length !== 1 ? 's' : ''} selected
            </div>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={cart.length === 0}
            >
              Submit Request for Quote ▸
            </button>
          </div>
        </>
      )}
    </div>
  )
}
