import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const rootDirectory = process.cwd()
const contentTypes: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

function serveNewsAssets(): Plugin {
  return {
    name: 'serve-news-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const rawPath = request.url?.split('?')[0] ?? ''
        let requestPath: string
        try {
          requestPath = decodeURIComponent(rawPath)
        } catch {
          response.statusCode = 400
          response.end('Bad request')
          return
        }

        const isNewsAsset = requestPath === '/latest.json'
          || requestPath === '/rss.xml'
          || requestPath.startsWith('/data/')
          || requestPath.startsWith('/search/')

        if (!isNewsAsset) {
          next()
          return
        }

        const filePath = path.resolve(rootDirectory, requestPath.slice(1))
        const relativePath = path.relative(rootDirectory, filePath)
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || !fs.existsSync(filePath)) {
          response.statusCode = 404
          response.end('Not found')
          return
        }

        response.setHeader('Content-Type', contentTypes[path.extname(filePath)] ?? 'application/octet-stream')
        response.setHeader('Cache-Control', 'no-store')
        response.end(fs.readFileSync(filePath))
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serveNewsAssets()],
})
