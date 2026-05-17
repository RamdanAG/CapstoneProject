import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname   = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR    = path.resolve(__dirname, '..', '..', '..')
const SCRAP_DIR   = path.join(ROOT_DIR, 'SCRAP')
const WRAPPER_PY  = path.join(ROOT_DIR, 'backend', 'aris_scraper_api.py')
const RAW_DIR     = path.join(SCRAP_DIR, 'data', 'raw')

const PY = process.platform === 'win32' ? 'python' : 'python3'

export async function scrapeProduct(url, limit = 50, onProgress) {
  if (!fs.existsSync(WRAPPER_PY)) throw new Error('aris_scraper_api.py tidak ditemukan di folder backend')

  return new Promise((resolve, reject) => {
    const proc = spawn(PY, [WRAPPER_PY, url, String(limit)])
    let err = ''

    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(Boolean)
      for (const line of lines) {
        console.log('[Scraper]', line)

        // Parse progress
        const match = line.match(/\[PROGRESS\] (\d+)\/(\d+)/)
        if (match) {
          onProgress?.(Number(match[1]), Number(match[2]))
        }
      }
    })

    proc.stderr.on('data', d => err += d.toString())

    proc.on('close', code => {
      if (code !== 0) return reject(new Error(err || `Scraper exit code ${code}`))

      // Ambil file CSV terbaru
      if (!fs.existsSync(RAW_DIR)) return reject(new Error('Folder raw tidak ditemukan'))

      const match     = url.match(/(\d{9,25})/)
      const productId = match?.[1] ?? ''
      const files     = fs.readdirSync(RAW_DIR)
        .filter(f => (!productId || f.includes(productId)) && f.endsWith('.csv'))
        .sort().reverse()

      if (!files[0]) return reject(new Error('File CSV tidak ditemukan setelah scraping'))

      const filepath = path.join(RAW_DIR, files[0])
      resolve(parseCSV(filepath))
    })
  })
}

function parseCSV(filepath) {
  const lines   = fs.readFileSync(filepath, 'utf-8').trim().split('\n')
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1).map(line => {
    const cols = []; let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') inQ = !inQ
      else if (ch === ',' && !inQ) { cols.push(cur); cur = '' }
      else cur += ch
    }
    cols.push(cur)
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']))
  })
}
