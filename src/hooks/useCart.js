import { useState, useCallback } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])

  const toggle = useCallback((item) => {
    setCart(prev => {
      const exists = prev.some(c => c.id === item.id)
      if (exists) return prev.filter(c => c.id !== item.id)
      return [...prev, item]
    })
  }, [])

  const remove = useCallback((id) => {
    setCart(prev => prev.filter(c => c.id !== id))
  }, [])

  const clear = useCallback(() => setCart([]), [])

  const inCart = useCallback((id) => cart.some(c => c.id === id), [cart])

  return { cart, toggle, remove, clear, inCart }
}
