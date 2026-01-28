import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema/index'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/ecommerce.db')
const dataDir = path.dirname(dbPath)

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log(`✓ Created data directory: ${dataDir}`)
}

const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

console.log('🔄 Running migrations...')

try {
  // Create tables using raw SQL (better-sqlite3 exec is for SQL, not shell commands)
  const createTables = `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      short_description TEXT,
      price_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      image_url TEXT,
      images TEXT,
      sku TEXT NOT NULL UNIQUE,
      weight_grams INTEGER,
      dimensions TEXT,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      tags TEXT,
      meta_title TEXT,
      meta_description TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0,
      reserved INTEGER NOT NULL DEFAULT 0,
      available INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      restocking_date INTEGER,
      supplier_id TEXT,
      location TEXT,
      notes TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      price_cents INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      expires_at INTEGER NOT NULL
    );
  `

  sqlite.exec(createTables)
  console.log('✓ Created base tables')

  // Create FTS5 virtual table and triggers (SQL execution, not shell)
  sqlite.exec(schema.productsFts)
  console.log('✓ Created FTS5 search index')

  // Create indexes (SQL execution, not shell)
  sqlite.exec(schema.cartItemsIndexes)
  console.log('✓ Created cart indexes')

  // Create additional indexes for performance (SQL execution, not shell)
  const performanceIndexes = `
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
  `
  sqlite.exec(performanceIndexes)
  console.log('✓ Created performance indexes')

  console.log('✅ Migrations completed successfully!')
  console.log(`📁 Database location: ${dbPath}`)
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
} finally {
  sqlite.close()
}
