import { spawn } from 'node:child_process'

export const processList = () => {
  const { promise, resolve, reject } = Promise.withResolvers()

  const parseLine = (line) => {
    const parts = line.trim().split(/\s+/);
    return {
      user: parts[0],
      pid: Number(parts[1]),
      mem: Number(parts[3]),
      command: parts.slice(10).join(' '),
    };
  }

  const procs = {}
  let output = ''
  
  const child = spawn('ps', ['aux'])
  child.stdout.on('data', (data) => {
    output += data.toString()
  })
  child.on('close', (code) => {
    const lines = output.trim().split('\n')
    lines.shift()

    for (const line of lines) {
      const proc = parseLine(line)
      procs[proc.pid] = proc
    }
    resolve(procs)
  })

  return promise
}

export const processKill = (pid) => {
  const child = spawn('kill', [pid])
  child.on('close', (code) => {
    console.log(`Process ${pid} killed with code ${code}`)
  })
}

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
