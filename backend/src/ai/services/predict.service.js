import { runPredict, getModelStatus } from '../modelLoader.js'

export async function predict(input) {
  const status = getModelStatus()
  if (status !== 'ready') {
    throw new Error(`Model belum siap. Status: ${status}`)
  }
  const output = await runPredict(input)
  return { input, output }
}
