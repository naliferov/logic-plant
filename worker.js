import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { processList, processKill, wait } from './utils.js'

const runWorker = (worker) => {
  const path = `workers/${worker}`
  const cmd = `
    node "${path}/worker.js" > "${path}/worker.log" 2>&1 &
    echo $! > "${path}/pid"
  `;
  const child = spawn('sh', ['-c', cmd], { detached: true, stdio: 'ignore' })
  child.unref()
}

const isWorkerEnabled = async (worker) => {
  const path = `workers/${worker}`
  const conf = JSON.parse(await fs.readFile(`${path}/conf.json`, 'utf8'))
  return conf.enabled
}

const getTime = () => {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const log = (msg, addTime = false) => {
  const str = addTime ? `${getTime()} ${msg}` : msg
  console.log(str)
}

const processWorkers = async () => {
  const workers = await fs.readdir('workers')
  for (const worker of workers) {
    log(`Processing worker ${worker}`)
  }

  log('\n', true)
}

while (true) {
  await processWorkers()
  await wait(2000)
}

//const list = await processList()
//console.log(list)

//processKill(12345)