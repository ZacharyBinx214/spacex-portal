import * as XLSX from 'xlsx'

// SharePoint direct-download URL - convert share link to download link
// The portal will try this first; falls back to manual upload if blocked
export const SHAREPOINT_URL =
  'https://awcinc0-my.sharepoint.com/:x:/g/personal/zach_sanders_awc-inc_com/IQBZnx8aTrbET73HE27rMMl1AUsA8R_bt-VzRPDhg164u4Y?e=3Lh8dl&download=1'

const CATEGORY_TYPE_MAP = {
  'SERIES 3000 BALL VALVES':       'Ball Valve',
  'SERIES 4000 BALL VALVES':       'Ball Valve',
  'SERIES 7000 BALL VALVES':       'Ball Valve',
  'SERIES 9000 BALL VALVES':       'Ball Valve',
  'Manual Handles':                 'Manual Handle',
  'Quadra Powr X Spring Diaphragm': 'Actuator',
  'VPVL ':                          'Actuator',
  'VPVL':                           'Actuator',
  'Valcon Linkage Kits':            'Linkage Kit',
  'StoneL':                         'Actuator Controller',
}

function inferSeries(category) {
  const m = category && category.match(/SERIES (\d+)/i)
  return m ? m[1] : null
}

function cleanSize(raw) {
  if (!raw) return null
  // Normalize compact fractions: 11/2 -> 1-1/2
  let s = String(raw).trim().replace(/"/g, '″')
  s = s.replace(/^(\d)(1\/2)/, '$1-1/2')
  s = s.replace(/^(\d)(1\/4)/, '$1-1/4')
  s = s.replace(/^(\d)(3\/4)/, '$1-3/4')
  return s
}

function inferEndConnection(category, port) {
  if (!category) return null
  const cat = category.toUpperCase()
  if (cat.includes('SCREWED') || cat.includes('NPT')) return 'NPT'
  if (cat.includes('FLANGED') || (port && String(port).includes('150')) || (port && String(port).includes('300'))) return 'Flanged'
  if (cat.includes('SOCKET')) return 'Socket Weld'
  if (cat.includes('WAFER')) return 'Wafer'
  if (cat.includes('LUG')) return 'Lug'
  return null
}

function normalizePort(raw) {
  if (!raw) return null
  const s = String(raw).toUpperCase()
  if (s.includes('FULL')) return 'Full Port'
  if (s.includes('STANDARD') || s.includes('STD')) return 'Standard Port'
  if (s.includes('REDUCED')) return 'Reduced Bore'
  return null
}

export function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' })

  // Use Stacked2 sheet - the structured one
  const sheetName = wb.SheetNames.includes('Stacked2') ? 'Stacked2' : wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  if (!rows || rows.length < 2) return []

  const headers = rows[0].map(h => h ? String(h).trim() : '')

  // Column index map
  const col = name => headers.findIndex(h => h === name)
  const iCat     = col('Category Header')
  const iModel   = col('Model Code:')
  const iDesc    = col('Product Description')
  const iSize    = col('Size')
  const iPort    = col('Port')
  const iBody    = col('Body')
  const iBolt    = col('Bolt')
  const iSeat    = col('Seat')
  const iNetwork = col('OH Jax Network')
  const iLocal   = col('OH Jacksonville')

  const items = []

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const model = r[iModel]
    if (!model) continue

    const category = r[iCat] || ''
    const type     = CATEGORY_TYPE_MAP[category.trim()] || CATEGORY_TYPE_MAP[category] || 'Valve / Component'
    const brand    = category.trim() === 'StoneL' ? 'StoneL' : 'Jamesbury'
    const series   = inferSeries(category)
    const size     = cleanSize(r[iSize])
    const port     = normalizePort(r[iPort])
    const body     = r[iBody] ? String(r[iBody]).trim() : null
    const seat     = r[iSeat] ? String(r[iSeat]).trim() : null
    const endConn  = inferEndConnection(category, r[iPort])

    const localQty   = typeof r[iLocal]   === 'number' ? r[iLocal]   : 0
    const networkQty = typeof r[iNetwork] === 'number' ? r[iNetwork] : 0

    // Clean description - replace literal inch marks
    const rawDesc = r[iDesc] ? String(r[iDesc]).replace(/"/g, '″').trim() : String(model)

    items.push({
      id:          String(model).replace(/"/g, '″'),
      description: rawDesc,
      category,
      type,
      brand,
      series,
      size,
      port,
      body,
      seat,
      endConnection: endConn,
      localQty,
      networkQty,
    })
  }

  return items
}

export async function fetchFromSharePoint() {
  const res = await fetch(SHAREPOINT_URL, { mode: 'cors' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = await res.arrayBuffer()
  return parseWorkbook(buf)
}
