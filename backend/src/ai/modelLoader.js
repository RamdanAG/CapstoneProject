import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PY        = process.platform === 'win32' ? 'python' : 'python3'

let pythonProcess = null
let modelStatus   = 'not_loaded'
let pendingQueue  = []
let buffer        = ''

export async function loadModel() {
  return new Promise((resolve, reject) => {
    modelStatus = 'loading'
    console.log('🔄 Loading ARIS model...')

    pythonProcess = spawn(PY, [path.join(__dirname, 'runner.py')])

    pythonProcess.stdout.on('data', (data) => {
      buffer += data.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const msg = JSON.parse(line)
          if (msg.status === 'ready') {
            console.log('🐍 Python runner ready')
          } else if (msg.status === 'model_loaded') {
            modelStatus = 'ready'
            console.log('✅ ARIS model loaded')
            resolve()
          } else if (msg.status === 'error') {
            modelStatus = 'error'
            console.error('❌ Model error:', msg.error)
            // Resolve bukan reject — server tetap jalan meski model gagal
            resolve()
          } else if (msg.ok !== undefined && pendingQueue.length > 0) {
            const { resolve: res, reject: rej } = pendingQueue.shift()
            msg.ok ? res(msg.output) : rej(new Error(msg.error))
          }
        } catch { /* bukan JSON */ }
      }
    })

    pythonProcess.stderr.on('data', (data) => {
      const msg = data.toString()
      if (!msg.includes('W tensorflow') && !msg.includes('WARNING') && !msg.includes('I tensorflow')) {
        console.error('[Python]', msg.trim())
      }
    })

    pythonProcess.on('close', (code) => {
      if (modelStatus === 'loading') {
        modelStatus = 'error'
        resolve() // tetap resolve biar server jalan
      } else {
        modelStatus = 'not_loaded'
      }
      console.warn(`⚠️  Python process exited (code ${code})`)
      // Flush pending
      pendingQueue.forEach(({ reject: rej }) => rej(new Error('Python process exited')))
      pendingQueue = []
    })

    // Timeout 60 detik kalau model tidak load-load
    setTimeout(() => {
      if (modelStatus === 'loading') {
        modelStatus = 'error'
        console.error('❌ Model load timeout (60s)')
        resolve()
      }
    }, 60000)
  })
}

export function runPredict(payload) {
  if (modelStatus !== 'ready') throw new Error(`Model belum siap: ${modelStatus}`)
  if (!pythonProcess)          throw new Error('Python process tidak berjalan')
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject })
    pythonProcess.stdin.write(JSON.stringify(payload) + '\n')
  })
}

export function getModelStatus() {
  return modelStatus
}
