import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let pythonProcess = null
let modelStatus = 'not_loaded'
let pendingResolvers = []
let buffer = ''

export async function loadModel() {
  return new Promise((resolve, reject) => {
    modelStatus = 'loading'
    console.log('🔄 Spawning Python AI runner...')

    pythonProcess = spawn('python3', [path.join(__dirname, 'runner.py')])

    // Baca output dari Python line by line
    pythonProcess.stdout.on('data', (data) => {
      buffer += data.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() // simpan sisa yang belum lengkap

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const msg = JSON.parse(line)

          // Status messages dari runner
          if (msg.status === 'ready') {
            console.log('🐍 Python runner ready')
          } else if (msg.status === 'model_loaded') {
            modelStatus = 'ready'
            console.log('✅ .keras model loaded')
            resolve()
          } else if (msg.status === 'error') {
            modelStatus = 'error'
            console.error('❌ Model error:', msg.error)
            reject(new Error(msg.error))
          }

          // Hasil prediksi
          else if (msg.ok !== undefined && pendingResolvers.length > 0) {
            const { resolve: res, reject: rej } = pendingResolvers.shift()
            if (msg.ok) res(msg.output)
            else rej(new Error(msg.error))
          }
        } catch {
          // bukan JSON, abaikan
        }
      }
    })

    pythonProcess.stderr.on('data', (data) => {
      // TF suka spam warning ke stderr, filter
      const msg = data.toString()
      if (!msg.includes('W tensorflow') && !msg.includes('WARNING')) {
        console.error('[Python]', msg.trim())
      }
    })

    pythonProcess.on('close', (code) => {
      modelStatus = 'not_loaded'
      console.warn(`⚠️  Python process exited (code ${code})`)
    })
  })
}

export async function runPredict(input) {
  if (modelStatus !== 'ready') {
    throw new Error(`Model belum siap. Status: ${modelStatus}`)
  }

  return new Promise((resolve, reject) => {
    pendingResolvers.push({ resolve, reject })
    // Kirim input ke Python via stdin
    pythonProcess.stdin.write(JSON.stringify({ input }) + '\n')
  })
}

export function getModelStatus() {
  return modelStatus
}
