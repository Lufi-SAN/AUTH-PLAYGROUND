import { createEmailWorker } from '../workers/emailWorker.js'

export function loadWorkers() {
  createEmailWorker()
}
