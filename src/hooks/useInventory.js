import { useState, useEffect, useCallback } from 'react'
import { fetchFromSharePoint, parseWorkbook } from '../utils/dataParser'

export function useInventory() {
  const [inventory, setInventory]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [source, setSource]         = useState(null) // 'sharepoint' | 'upload' | null
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadFromSharePoint = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFromSharePoint()
      setInventory(data)
      setSource('sharepoint')
      setLastUpdated(new Date())
    } catch (err) {
      setError('sharepoint_blocked')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFromFile = useCallback((file) => {
    setLoading(true)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = parseWorkbook(e.target.result)
        setInventory(data)
        setSource('upload')
        setLastUpdated(new Date())
        setError(null)
      } catch (err) {
        setError('parse_error')
      } finally {
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('read_error')
      setLoading(false)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  // Try SharePoint on mount
  useEffect(() => {
    loadFromSharePoint()
  }, [loadFromSharePoint])

  return {
    inventory,
    loading,
    error,
    source,
    lastUpdated,
    loadFromSharePoint,
    loadFromFile,
  }
}
