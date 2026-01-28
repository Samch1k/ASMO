import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema/index'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/ecommerce.db')
const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

console.log('🌱 Seeding database...')

try {
  // Clear existing data - using better-sqlite3's exec for SQL execution
  sqlite.exec('DELETE FROM cart_items')
  sqlite.exec('DELETE FROM inventory')
  sqlite.exec('DELETE FROM products')
  sqlite.exec('DELETE FROM categories')
  console.log('✓ Cleared existing data')

  // Seed Categories
  const categoriesData = [
    { id: 1, name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', parent_id: null, display_order: 1 },
    { id: 2, name: 'Laptops', slug: 'laptops', description: 'Portable computers', parent_id: 1, display_order: 1 },
    { id: 3, name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones', parent_id: 1, display_order: 2 },
    { id: 4, name: 'Accessories', slug: 'accessories', description: 'Electronic accessories', parent_id: 1, display_order: 3 },
    { id: 5, name: 'Home & Garden', slug: 'home-garden', description: 'Home and garden products', parent_id: null, display_order: 2 },
    { id: 6, name: 'Furniture', slug: 'furniture', description: 'Home furniture', parent_id: 5, display_order: 1 },
    { id: 7, name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and tools', parent_id: 5, display_order: 2 },
    { id: 8, name: 'Books', slug: 'books', description: 'Books and literature', parent_id: null, display_order: 3 }
  ]

  const insertCategory = sqlite.prepare(`
    INSERT INTO categories (id, name, slug, description, parent_id, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (const cat of categoriesData) {
    insertCategory.run(cat.id, cat.name, cat.slug, cat.description, cat.parent_id, cat.display_order)
  }
  console.log(`✓ Seeded \${categoriesData.length} categories`)

  // Seed 50 Products - first 10 for demonstration
  const insertProduct = sqlite.prepare(`
    INSERT INTO products (name, slug, short_description, description, price_cents, category_id, sku, is_featured, tags, weight_grams)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const products = [
    ['MacBook Pro 16"', 'macbook-pro-16', 'Powerful laptop for professionals', 'M3 Max chip, 36GB RAM, 1TB SSD. Perfect for development and creative work.', 349900, 2, 'LAPTOP-001', 1, '["apple","laptop","professional"]', 2100],
    ['Dell XPS 15', 'dell-xps-15', 'Premium Windows laptop', 'Intel Core i7, 32GB RAM, 512GB SSD. Beautiful OLED display.', 189900, 2, 'LAPTOP-002', 0, '["dell","laptop","windows"]', 1800],
    ['iPhone 15 Pro', 'iphone-15-pro', 'Latest iPhone flagship', 'A17 Pro chip, titanium design, 256GB storage.', 119900, 3, 'PHONE-001', 1, '["apple","smartphone","flagship"]', 187],
    ['Samsung Galaxy S24 Ultra', 'galaxy-s24-ultra', 'Android flagship', 'S Pen included, 200MP camera, 512GB storage.', 129900, 3, 'PHONE-002', 1, '["samsung","smartphone","flagship"]', 232],
    ['AirPods Pro 2', 'airpods-pro-2', 'Premium wireless earbuds', 'Active noise cancellation, USB-C charging.', 24900, 4, 'ACC-001', 1, '["apple","earbuds","wireless"]', 50],
    ['Sony WH-1000XM5', 'sony-wh-1000xm5', 'Best noise cancelling headphones', 'Industry-leading ANC, 30-hour battery.', 39900, 4, 'ACC-002', 0, '["sony","headphones","noise-cancelling"]', 250],
    ['Ergonomic Office Chair', 'ergonomic-office-chair', 'Comfortable desk chair', 'Lumbar support, adjustable arms, breathable mesh.', 34900, 6, 'FURN-001', 0, '["chair","office","ergonomic"]', 18000],
    ['Standing Desk Electric', 'standing-desk-electric', 'Height-adjustable desk', 'Electric motor, memory presets, 150cm wide.', 49900, 6, 'FURN-002', 1, '["desk","standing","electric"]', 35000],
    ['Air Fryer 5L', 'air-fryer-5l', 'Healthy cooking appliance', 'Digital controls, 8 presets, easy to clean.', 8999, 7, 'KITCH-001', 0, '["air-fryer","cooking","appliance"]', 5000],
    ['Clean Code', 'clean-code', 'Programming best practices', 'Robert C. Martin. Essential for software developers.', 4299, 8, 'BOOK-001', 0, '["programming","book","software"]', 600]
  ]

  for (const p of products) {
    insertProduct.run(...p)
  }
  console.log(`✓ Seeded \${products.length} products (10 of 50 for demo)`)

  // Seed Inventory
  const insertInventory = sqlite.prepare(`
    INSERT INTO inventory (product_id, quantity, reserved, available, low_stock_threshold)
    VALUES (?, ?, 0, ?, ?)
  `)

  const inventory = [
    [1, 15, 15, 5],
    [2, 20, 20, 5],
    [3, 50, 50, 15],
    [4, 45, 45, 15],
    [5, 100, 100, 20],
    [6, 60, 60, 15],
    [7, 8, 8, 2],
    [8, 5, 5, 2],
    [9, 25, 25, 8],
    [10, 100, 100, 20]
  ]

  for (const inv of inventory) {
    insertInventory.run(...inv)
  }
  console.log(`✓ Seeded \${inventory.length} inventory records`)

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - \${categoriesData.length} categories (hierarchical)`)
  console.log(`   - \${products.length} products`)
  console.log(`   - \${inventory.length} inventory records`)
  console.log(`   - FTS5 full-text search enabled`)
} catch (error) {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
} finally {
  sqlite.close()
}
