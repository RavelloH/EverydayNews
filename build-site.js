const fs = require('node:fs')
const path = require('node:path')

const rootDirectory = __dirname
const distDirectory = path.join(rootDirectory, 'dist')

if (!fs.existsSync(distDirectory)) {
  throw new Error('dist directory does not exist. Run vite build first.')
}

for (const directory of ['data', 'search']) {
  const source = path.join(rootDirectory, directory)
  const target = path.join(distDirectory, directory)
  if (!fs.existsSync(source)) {
    throw new Error(`Missing generated directory: ${directory}`)
  }
  fs.cpSync(source, target, { recursive: true })
}

for (const file of ['latest.json', 'rss.xml']) {
  fs.copyFileSync(path.join(rootDirectory, file), path.join(distDirectory, file))
}

console.log('Static archive assets copied to dist/.')
