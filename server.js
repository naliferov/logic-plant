import http from 'http'
import fs from 'fs'

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500)
        res.end('index.html not found')
        return
      }
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    })

    return
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      fs.writeFile('index.html', body, 'utf8', err => {
        res.writeHead(200)
        res.end('Saved')
      })
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})