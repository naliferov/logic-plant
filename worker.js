import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { getProcessList, processKill, wait, getTime, log } from './utils.js'

const getWorkerPid = async (worker) => {
  const path = `workers/${worker}`
  try {
    const pid = await fs.readFile(`${path}/pid`, 'utf8')
    if (pid) return pid.trim()
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

const isWorkerEnabled = async (worker) => {
  const path = `workers/${worker}`
  const conf = JSON.parse(await fs.readFile(`${path}/conf.json`, 'utf8'))
  return conf.enabled
}

const isProcessActive = async (pid) => {
  const processList = await getProcessList()
  return processList[pid] ? true : false
}

const runWorker = async(worker) => {
  const path = `workers/${worker}`
  const workerFile = `${path}/worker.js`
  const logFile = await fs.open(`${path}/worker.log`, 'a')

  const child = spawn('node', [workerFile], {
    detached: true,
    stdio: ['ignore', logFile.fd, logFile.fd],
  })

  const pid = child.pid

  child.unref()
  await logFile.close()

  return pid
}

const processWorker = async (worker) => {
  log(`[${worker}] worker`)

  const path = `workers/${worker}`
  const enabled = await isWorkerEnabled(worker)
  const pid = await getWorkerPid(worker)

  if (enabled) {
    log(`is enabled`)

    if (pid) {
      let str = `pid [${pid}]`
      if (await isProcessActive(pid)) str += ` active`
      else {
        str += ` not active. start [${worker}]`

        const pid = await runWorker(worker)
        if (pid) {
          str += ` pid [${pid}] started`
          await fs.writeFile(`${path}/pid`, pid.toString())
        }
      }
      log(str)
    } else {

      log(`pid not found. so start [${worker}]`)
      const pid = await runWorker(worker)
      if (pid) {
        log(` pid [${pid}]`)
        await fs.writeFile(`${path}/pid`, pid)
      }
    }

    log('\n', true)
    return
  }


  log(`is disabled`)
  // check that pid not in list

  // find pid, check if process is running
  //runWorker(worker)

  log('\n', true)
}

const processWorkers = async () => {
  const workers = await fs.readdir('workers')
  for (const worker of workers) {
    await processWorker(worker)
  }
}

while (true) {
  await processWorkers()
  await wait(4000)
}

//const list = await processList()
//console.log(list)

//processKill(12345)