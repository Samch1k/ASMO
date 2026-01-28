import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '../../data/blog.db')
const db = new Database(dbPath)

try {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
  db.exec(schema)
  console.log('✓ Database migration completed successfully')
  console.log(`  Database file: ${dbPath}`)
} catch (error) {
  console.error('✗ Database migration failed:', error.message)
  process.exit(1)
} finally {
  db.close()
}
